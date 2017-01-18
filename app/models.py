from app import db
from icalendar import Event
from icalendar.prop import vDDDTypes


class Module(db.Model):
    code = db.Column(db.String(6), primary_key=True)
    title = db.Column(db.String(50))

    def __init__(s, code, title, **kwargs):
        s.code = code
        s.title = title

    def __str__(s):
        return '%s - %s' % (s.code, s.title)

    def __repr__(s):
        return s.code


class Section(db.Model):
    class_no = db.Column(db.Integer, primary_key=True, autoincrement=False)
    mod_code = db.Column(db.String(6), db.ForeignKey(Module.code))
    name = db.Column(db.String(5))
    last_updated = db.Column(
        db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    module = db.relationship("Module", foreign_keys=mod_code)

    def __init__(s, class_no, mod_code, name):
        s.class_no = class_no
        s.mod_code = mod_code
        s.name = name

    @property
    def updated(s):
        return int(s.last_updated.timestamp())

    @property
    def details(s):
        return (s.name, s.updated)

    def __str__(s):
        return '%s/%s' % (s.mod_code, s.name)

    def __repr__(s):
        return "<Section %s>" % s.class_no


class Location(db.Model):
    code = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(50))

    def __str__(s):
        return "%s (%s)" % (s.name, s.code)

    def __repr__(s):
        return "<Location %s>" % (s.code)


class Lesson(db.Model):
    class_no = db.Column(
        db.Integer, db.ForeignKey(Section.class_no), primary_key=True)
    sn = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    component = db.Column(db.String(20))
    loc_code = db.Column(db.String(20), db.ForeignKey(Location.code))

    section = db.relationship("Section", foreign_keys=class_no)
    location = db.relationship("Location", foreign_keys=loc_code)

    def __init__(s, class_no, sn, dts, component, location):
        s.class_no = class_no
        s.sn = sn
        s.start, s.end = dts
        s.component = component
        s.loc_code = location

    @property
    def title(s):
        return str(s.section.module)

    @property
    def details(s):
        return {
            'title': s.title,
            'description': str(s),
            'start': s.start.isoformat(),
            'end': s.end.isoformat(),
        }

    @property
    def event(s):
        return Event(**{
            'summary': s.title,
            'description': str(s),
            'location': str(s.location),
            'dtstart': vDDDTypes(s.start),
            'dtend': vDDDTypes(s.end),
        })

    def __str__(s):
        return "%s (%s)" % (s.component, s.section.name)

    def __repr__(s):
        return "<Lesson %s #%s>" % (s.class_no, s.sn)
