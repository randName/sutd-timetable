import os, re, json

from icalendar import Calendar, Event
from collections import defaultdict
from datetime import datetime

DATA_DIR = "data"
TMP_FILE = "tmp"
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

def add_schedule( modfile, lesson ):
    with open( "%s/%s" % ( DATA_DIR, TMP_FILE ), 'a' ) as f:
        print( "%s\t%s" % ( modfile, json.dumps( lesson ) ), file=f )

def load_schedule():
    to_write = defaultdict(list)
    def push(f,l): to_write[f].append(l)

    with open( "%s/%s" % ( DATA_DIR, TMP_FILE ) ) as f:
        for line in f: push(*line.rstrip('\n').split('\t'))

    for modfile, l in to_write.items():
        code, section = modfile.split('/')
        os.makedirs( "%s/%s" % ( DATA_DIR, code ), exist_ok=True )
        with open( "%s/%s" % ( DATA_DIR, modfile ), 'w' ) as f:
            print( "[%s]" % ', '.join(l), file=f )

    os.remove( "%s/%s" % ( DATA_DIR, TMP_FILE ) )

def parse_item( upload ):
    for k in upload: upload[k] = upload[k][0]

    if 'block' in upload:
        load_schedule()

    elif 'sub' in upload:
        get_date = lambda x: list(map(int,x.split('.')))
        dt = [ int(i) for i in reversed( upload['d'].split('.') ) ]
        item = {
            'description': upload['c'], 'location': upload['l'],
            'start': dt + get_date(upload['s']),
            'end': dt + get_date(upload['e']),
        }
        add_schedule( upload['sub'].replace('-','/'), item )

    elif 'module' in upload:
        print( upload )

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
