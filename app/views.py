from datetime import datetime, date
from icalendar import Calendar, Event
from flask import request, json
from time import time
from app import rd, db, app
from .models import *

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/locations')
def get_locations():
    return json.jsonify({ l.code: l.name for l in Location.query.all() })

@app.route('/groups')
def get_groups():
    return json.jsonify({
        g:tuple(rd.smembers('group:%s'%g)) for g in rd.smembers('groups')
    })

@app.route('/modules')
def get_modules():

    def module(m):
        sections = Section.query.filter_by(mod_code=m.code).all()
        return {
            'title': m.title,
            'sections': {s.class_no: s.details for s in sections}
        }

    return json.jsonify({m.code: module(m) for m in Module.query.all()})

@app.route('/group_sections/')
def get_group_sections():

    q = request.query_string.decode()
    if not q: return json.jsonify({'status': 'error'})
    codes = rd.smembers('group:%s'%q)
    all_cn = []

    for cn in codes:
        try:
            all_cn.insert(0, int(cn))
        except ValueError:
            continue

    schedule = tuple(
        lesson.details
        for lesson in Lesson.query.filter(Lesson.class_no.in_(all_cn))
        .order_by(Lesson.start).all()
    )

    return json.jsonify({
            'status': 'ok', 'events': schedule
        })

@app.route('/section/<int:cn>')
def get_section(cn):

    section = Section.query.get(cn)
    if not section: return json.jsonify({'status':'error'})

    schedule = tuple(
        lesson.details for lesson in Lesson.query.filter_by(class_no=cn).all()
    )

    return json.jsonify({
        'status': 'ok', 'events': schedule, 'updated': section.updated
    })

@app.route('/calendar')
def get_timetable():

    q = request.query_string.decode()
    if not q: return '', 200, {'content-type': 'text/calendar'}

    if ',' in q:
        calds = None
        codes = q.split(',')
    else:
        calds = q
        codes = rd.smembers('group:%s'%q)

    sct = []
    all_cn = []

    for cn in codes:
        try:
            cn = int(cn)
        except ValueError:
            continue

        section = Section.query.get(cn)
        if not section: continue

        all_cn.append(cn)
        sct.append(str(section))

    if calds is None: calds = ', '.join(sct)

    cal = Calendar(**{
        'prodid': '-//SUTD Timetable Calendar//randName//EN',
        'version': '2.0',
        'calscale': 'GREGORIAN',
        'x-wr-timezone': 'Asia/Singapore',
        'x-wr-calname': 'Timetable',
        'x-wr-caldesc': 'Timetable for %s' % calds,
    })

    for lesson in Lesson.query.filter(Lesson.class_no.in_(all_cn)).all():
        cal.add_component(Event(**lesson.event))

    return cal.to_ical(), 200, {'content-type': 'text/calendar'}

@app.route('/upload', methods=['POST'])
def load_data():

    module = request.get_json()
    if not Module.query.get(module['code']):
        db.session.add(
            Module(**{'code': module['code'], 'title': module['title']})
        )

    sections = []
    grp_sect = []

    for cn, section in module['sections'].items():
        cn = int(cn)
        sct = Section.query.get(cn)

        if not sct:
            db.session.add(Section(**{
                'class_no': cn,
                'name': section['name'],
                'mod_code': module['code']
            }))
            db.session.commit()
        else:
            sct.last_updated = datetime.now()
            Lesson.query.filter_by(class_no=cn).delete()

        sections.append(section['name'])
        grp_sect.append(cn)

        sn = 0
        for i in section['schedule']:
            d = tuple(int(n) for n in reversed(i['d'].split('.')))
            dts = [datetime(*(d+tuple(map(int,i[l].split('.'))))) for l in 'se']
            db.session.add(Lesson(**{
                'class_no': cn, 'sn': sn, 'dts': dts,
                'location': i['l'], 'component':i['c'],
            }))
            sn += 1

        db.session.commit()

    gtime = int(time())
    rd.sadd('tgrps', gtime)
    rd.sadd('tgrp:%s'%gtime, *grp_sect)

    return json.jsonify({
        'status': 'ok', 'loaded': (module['code'], ', '.join(sections))
    })
