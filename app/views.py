from datetime import datetime
from icalendar import Calendar, Event
from flask import request, json
from app import db, models, app
from .models import Module, Section, Lesson

@app.route('/')
def index():
    return app.send_static_file("index.html")

@app.route('/locations')
def get_locations():
    return app.send_static_file("SUTD_locations")

@app.route('/modules')
def get_modules():

    modulelist = {}
    for module in Module.query.all():
        modulelist[module.code] = { 'title': module.title }

        sections = {}
        for section in Section.query.filter_by(mod_code=module.code).all():
            sections[section.class_no] = ( section.name, int(section.last_updated.timestamp()) )
        modulelist[module.code]['sections'] = sections

    return json.jsonify(modulelist)

@app.route('/ics')
def get_timetable():

    def get_location( l ): return "%s (%s)" % ( locations.get(l,"TBD"), l )

    def get_event( section, lesson ):
        e = {
            'summary': str(section.module),
            'description': "%s (%s)" % ( lesson.component, section.name ),
            'location': get_location( lesson.location ),
            'dtstart': lesson.start, 'dtend': lesson.end,
        }

        event = Event()
        for k, v in e.items(): event.add(k,v)
        return event

    q = request.query_string.decode()
    if not q: return json.jsonify({'status':'error'})

    locations = json.load( get_locations().response.file )

    sections = []
    cal = Calendar()

    for cn in q.split(','):
        try:
            cn = int(cn)
        except ValueError:
            continue

        section = Section.query.get(cn)
        if not section: continue

        schedule = Lesson.query.filter_by(class_no=cn).all()
        for lesson in schedule: cal.add_component( get_event( section, lesson ) )

        sections.append( str(section) )

    caldict = {
        'prodid': '-//SUTD Timetable Calendar//randName//EN',
        'version': '2.0',
        'calscale': 'GREGORIAN',
        'x-wr-timezone': 'Asia/Singapore',
        'x-wr-calname': 'Timetable',
        'x-wr-caldesc': 'Timetable for ' + ', '.join( sections ),
    }

    for k, v in caldict.items(): cal.add(k,v)

    return cal.to_ical(), 200, {'content-type': 'text/calendar'}

@app.route('/upload', methods=['POST'])
def load_data():
    
    module = request.get_json()
    if not Module.query.get(module['code']):
        db.session.add( Module(**{'code': module['code'], 'title': module['title']}) )

    sections = []
    for cn, section in module['sections'].items():
        cn = int(cn)
        sct = Section.query.get(cn)

        if not sct:
            sc = { 'class_no': cn, 'mod_code': module['code'], 'name': section['name'] }
            db.session.add( Section(**sc) )
            db.session.commit()
            print( "added %s" % sc )
        else:
            sct.last_updated = datetime.now()
            Lesson.query.filter_by(class_no=cn).delete()

        sections.append( section['name'] )

        sn = 0
        for i in section['schedule']:
            d = [ int(n) for n in reversed( i['d'].split('.') ) ]
            dts = [ datetime(*(d+list(map(int,i[l].split('.'))))) for l in ('s','e') ]
            lesson = {
                'class_no': cn, 'sn': sn, 'location': i['l'],
                'start': dts[0], 'end': dts[1], 'component':i['c'],
            }
            db.session.add( Lesson(**lesson) )
            sn += 1

        db.session.commit()

    return json.jsonify({'status': 'ok','loaded': (module['code'], ', '.join(sections)) })
