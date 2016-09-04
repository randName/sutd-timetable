from app import db


class Module(db.Model):
    code = db.Column(db.String(6), primary_key=True)
    title = db.Column(db.String(30))

    def __init__(s, code, title):
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


class Lesson(db.Model):
    class_no = db.Column(
        db.Integer, db.ForeignKey(Section.class_no), primary_key=True)
    sn = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime)
    end = db.Column(db.DateTime)
    component = db.Column(db.String(20))
    location = db.Column(db.String(10))

    section = db.relationship("Section", foreign_keys=class_no)

    def __init__(s, class_no, sn, dts, component, location):
        s.class_no = class_no
        s.sn = sn
        s.start, s.end = dts
        s.component = component
        s.location = location

    @property
    def title(s):
        return str(s.section.module)

    def __str__(s):
        return "%s (%s)" % (s.component, s.section.name)

    def __repr__(s):
        return "<Lesson %s #%s>" % (s.class_no, s.sn)
