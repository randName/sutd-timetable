import os, re, json

from icalendar import Calendar, Event
from collections import defaultdict
from datetime import datetime
from bs4 import BeautifulSoup

modulepath = "data/modules"
locationfile = "data/SUTD_locations"

def readjson( path ):
    """Read JSON from file."""
    try:
        with open( path ) as f: return json.loads( f.read() )
    except EnvironmentError:
        return None

def writejson( js ):
    """Write to JSON file."""
    mod = js['title'].split(' - ')[0].replace(' ','')
    os.makedirs( "%s/%s" % ( modulepath, mod ), exist_ok=True )

    with open( "%s/%s/%s" % ( modulepath, mod, js['section'] ), 'w' ) as f:
        print( json.dumps( js ), file=f )

def get_location_id( location ):
    for k, v in locations.items():
        if v == location: return k

def parse_html( page ):

    def get_row( row ):
        tag = re.compile(r'MTG_([^$]+)')

        iz = {}

        for td in row('td'):
            try:
                iz[ tag.search( td.div.get('id') ).group(1) ] = td.div.span.string
            except:
                pass

        return iz

    wks = ( 'description', 'start', 'end', 'location' )

    locations = readjson( locationfile )

    soup = BeautifulSoup( page, 'html.parser' )

    table = soup.find('table',id='ACE_STDNT_ENRL_SSV2$0')

    for mod in table.find_all('table',class_="PSGROUPBOXWBO"):
        schedule = []

        for row in mod.find_all('tr',id=re.compile(r'^trCLASS_MTG_VW')):
            iz = get_row( row )

            if 'SECTION' in iz: section = iz['SECTION']
            if iz['COMP'] != '\xa0': component = iz['COMP']

            dt = [ int(i) for i in reversed( iz['DATES'].split(' - ')[0].split('/') ) ]
            tm = [ list(map(int,t.split(':'))) for t in iz['SCHED'].split(' ') if ':' in t ]

            info = {
                'section': section, 'description': component,
                'start': dt + tm[0], 'end': dt + tm[1],
                'location': get_location_id(iz['LOC']),
            }

            schedule.append( info )

        dd = defaultdict(list)

        for item in schedule: dd[item['section']].append({ k: item[k] for k in wks })

        for k, v in dd.items(): writejson({ 'title': mod.td.string, 'section': k, 'schedule': v })

def get_timetable( subject_codes, name="Timetable", description="" ):


    def get_event( title, section, l ):

        e = {
            'summary': title,
            'description': "%s (%s)" % ( l['description'], section ),
            'location': getloc(l['location']),
            'dtstart': datetime(*l['start']),
            'dtend': datetime(*l['end']),
        }

        event = Event()
        for k, v in e.items(): event.add(k,v)
        return event

    caldict = {
        'prodid': '-//SUTD Timetable Calendar//randName//EN',
        'version': '2.0',
        'calscale': 'GREGORIAN',
        'x-wr-timezone': 'Asia/Singapore',
        'x-wr-calname': name,
        'x-wr-caldesc': description,
    }

    locations = readjson( locationfile )

    getloc = lambda l: "%s (%s)" % ( locations.get(l,"TBD"), l )

    cal = Calendar()

    for k, v in caldict.items(): cal.add(k,v)

    for code in subject_codes:
        s = readjson( "%s/%s" % ( modulepath, code ) )
        if not s: continue
        for l in s['schedule']: cal.add_component( get_event( s['title'], s['section'], l ) )

    return cal.to_ical()

if __name__ == '__main__':
    codes = []
    for root, subdirs, files in os.walk( modulepath ):
        codes.extend([ os.path.join( os.path.basename( root ), f ) for f in files ])
    timetable = get_timetable( codes )
    print( timetable )

    #with open( 'schedule.html' ) as f: parse_page( f.read() )
