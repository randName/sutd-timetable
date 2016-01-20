import os, re, json

from icalendar import Calendar, Event
from collections import defaultdict
from datetime import datetime
from bs4 import BeautifulSoup

DATA_DIR = "data"
MOD_FILE = "modules"
LOC_FILE = "SUTD_locations"

def readjson( path ):
    """Read JSON from file."""
    try:
        with open( "%s/%s" % ( DATA_DIR, path ) ) as f: return json.loads( f.read() )
    except EnvironmentError:
        return None

def writejson( path, js ):
    """Write to JSON file."""
    with open( "%s/%s" % ( DATA_DIR, path ), 'w' ) as f:
        print( json.dumps( js ), file=f )

def writemod( code, section, schedule ):
    os.makedirs( "%s/%s" % ( DATA_DIR, code ), exist_ok=True )
    writejson( "%s/%s" % ( code, section ), schedule )

def get_location_id( locations, location ):
    for k, v in locations.items():
        if v == location: return k
    return location

def parse_html( page ):

    def get_time( t ):
        tm = list( map( int, t.group(1,2) ) )
        if t.group(3) == "PM" and tm[0] < 12: tm[0] += 12

        return tm

    def get_row( row ):
        tag = re.compile(r'MTG_([^$]+)')

        iz = {}

        for td in row('td'):
            try:
                iz[ tag.search( td.div.get('id') ).group(1) ] = td.div.span.string
            except:
                pass

        return iz

    soup = BeautifulSoup( page, 'html.parser' )

    table = soup.find('table',id='ACE_STDNT_ENRL_SSV2$0')

    if not table: return None

    time_str = re.compile(r'([\d]+):([\d]+)(AM|PM)?')
    locations = readjson( LOC_FILE )
    modules = readjson( MOD_FILE )

    processed = []

    for mod in table.find_all('table',class_="PSGROUPBOXWBO"):
        schedule = defaultdict(list)

        title = mod.td.string.split(' - ')
        code = title[0].replace(' ','')
        title = title[1]

        for row in mod.find_all('tr',id=re.compile(r'^trCLASS_MTG_VW')):
            iz = get_row( row )

            if 'SECTION' in iz: section = iz['SECTION']
            if iz['COMP'] != '\xa0': component = iz['COMP']
            dt = [ int(i) for i in reversed( iz['DATES'].split(' - ')[0].split('/') ) ]
            tm = [ get_time( t ) for t in time_str.finditer( iz['SCHED'] ) ]

            info = {
                'description': component,
                'start': dt + tm[0], 'end': dt + tm[1],
                'location': get_location_id(locations,iz['LOC']),
            }

            schedule[section].append( info )

        for k, v in schedule.items(): writemod( code, k, v )

        nw = "{:%Y/%m/%d}".format( datetime.now() )

        if code not in modules:
            modules[code] = { 'title': title, 'sections': [] }
            current_sections = []
        else:
            current_sections = [ s[0] for s in modules[code]['sections'] ]

        for section in schedule.keys():
            if section in current_sections:
                modules[code]['sections'][current_sections.index(section)][1] = nw
            else:
                modules[code]['sections'].append( ( section, nw ) )

        processed.append( ( "%s - %s" % ( code, title ), ', '.join(schedule.keys()) ) )

    writejson( MOD_FILE, modules )

    return processed

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

    locations = readjson( LOC_FILE )
    modules = readjson( MOD_FILE )

    getloc = lambda l: "%s (%s)" % ( locations.get(l,"TBD"), l )

    cal = Calendar()

    for k, v in caldict.items(): cal.add(k,v)

    for code, section in subject_codes:
        schedule = readjson( "%s/%s" % ( code, section ) )
        if not schedule: continue
        title = "%s - %s" % ( code, modules[code]['title'] )
        for l in schedule: cal.add_component( get_event( title, section, l ) )

    return cal.to_ical()

if __name__ == '__main__':
    codes = []
    for root, subdirs, files in os.walk( DATA_DIR ):
        codes.extend([ os.path.join( os.path.basename( root ), f ) for f in files ])
    print( codes )
