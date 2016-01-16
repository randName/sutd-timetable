import json

from icalendar import Calendar, Event
from datetime import datetime

def get_timetable( subject_codes, name="Timetable", description="" ):

    def jsonfile( path ):
        try:
            with open( path ) as f: return json.loads( f.read() )
        except EnvironmentError:
            return None

    def get_event( title, l ):

        e = {
            'summary': title,
            'description': l['description'],
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

    locations = jsonfile( "data/SUTD_locations" )

    getloc = lambda l: "%s (%s)" % ( locations.get(str(l),"TBA"), l )

    if not locations: getloc = lambda l: l

    cal = Calendar()

    for k, v in caldict.items(): cal.add(k,v)

    for code in subject_codes:
        s = jsonfile( "data/modules/%s" % code )
        if not s: continue
        for l in s['schedule']: cal.add_component( get_event( s['title'], l ) )

    return cal.to_ical()

if __name__ == '__main__':
    codes = [ "10.{0:03d}/{1}".format(module,7) for module in (7,8,9,11) ]
    timetable = get_timetable( codes )
    print( timetable )
