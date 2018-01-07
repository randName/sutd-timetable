from datetime import datetime

from flask import request, json, abort

from app import rd, db, api
from .models import Module, Section, Lesson, Location


@api.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@api.route('/locations')
def get_locations():
    return json.jsonify({
        'locations': tuple(l.detail for l in Location.query.all()),
    })


@api.route('/modules')
def get_modules():
    return json.jsonify({
        'modules': tuple(m.detail for m in Module.query.all())
    })


@api.route('/section/<int:cn>')
def get_section(cn):
    section = Section.query.get(cn)
    if not section:
        abort(404)

    return json.jsonify({
        'name': section.name,
        'updated': section.updated,
        'schedule': section.schedule,
        'module': section.module.summary,
    })


@api.route('/groups')
def get_groups():

    def group(g):
        return {
            'name': g,
            'sections': sorted(rd.smembers('group:%s' % g)),
        }

    return json.jsonify({
        'groups': sorted(
            (group(g) for g in rd.smembers('groups')),
            key=lambda x: x['name']
        )
    })


@api.route('/upload', methods=['POST'])
def load_data():
    module = request.get_json()

    if 'group' in module:
        try:
            gt = 'group'
            lb = module['label']
        except (KeyError, ValueError):
            h = hash(frozenset(int(i) for i in module['group']))
            gt = 'hgrp'
            lb = '%05d' % (h % 100000)

        rd.sadd('{}s'.format(gt), lb)
        rd.sadd('%s:%s' % (gt, lb), *module['group'])

        return json.jsonify({
            'status': 'ok',
        })

    if not Module.query.get(module['code']):
        db.session.add(Module(**module))

    sections = []

    for cn, section in module['sections'].items():
        try:
            cn = int(cn)
        except ValueError:
            continue

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

        for i in section['schedule']:
            d = get_int(i['d'])
            dts = tuple(datetime(*(d+get_int(i[l]))) for l in 'se')
            db.session.add(Lesson(**{
                'dts': dts,
                'class_no': cn,
                'location': i['l'],
                'component': i['c'],
            }))

        db.session.commit()

    return json.jsonify({
        'status': 'ok',
    })


def get_int(dt):
    return tuple(int(n) for n in dt.split('.'))
