import json

from icalendar import Calendar, Event
from datetime import datetime

def get_timetable( subject_codes, name="Timetable", description="" ):

    def jsonfile( path ):
        with open( path ) as f: j = json.loads( f.read() )
        return j

    def get_event( title, e ):
        event = Event()

        event.add('summary', title)
        event.add('description', e['type'])
        event.add('dtstart', datetime(*e['dt'][0]))
        event.add('dtend', datetime(*e['dt'][1]))
        event.add('location', getloc(e['location']))

        return event

    caldict = {
        'prodid': '-//SUTD Timetable Calendar//randName//EN',
        'version': '2.0',
        'calscale': 'GREGORIAN',
        'x-wr-timezone': 'Asia/Singapore',
    }

    locations = jsonfile( "data/SUTD_locations" )

    getloc = lambda l: "%s (%s)" % ( locations.get(str(l),"TBA"), l )

    cal = Calendar()

    for k, v in caldict.items(): cal.add(k,v)

    cal.add('x-wr-calname', name)
    cal.add('x-wr-caldesc', description)

    for code in subject_codes:
        s = jsonfile( "data/modules/%s" % code )
        for l in s['schedule']: cal.add_component( get_event( s['title'], l ) )

    return cal.to_ical()

if __name__ == '__main__':
    codes = [ "10.{0:03d}/{1}".format(module,7) for module in (7,8,9,11) ]
    timetable = get_timetable( codes )
    print( timetable )
