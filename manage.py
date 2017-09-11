import click
from app import app, db, rd
from app.models import Lesson, Location

@click.group()
def cli():
    pass

@click.command()
@click.option('--host', default='0.0.0.0', help='Address to bind')
@click.option('--port', default=5000, help='Port to bind')
@click.option('--debug', is_flag=True, help='Debug mode')
def runserver(host, port, debug):
    """Run server"""
    app.run(host=host, port=port, debug=debug)

@click.command()
def resetdb():
    """Reset databases"""
    click.echo('Resetting databases...')
    db.drop_all()
    db.create_all()
    ll()
    click.echo('Done')

@click.command()
def load_locations():
    """Load locations"""
    click.echo('Loading locations')
    ll()

def ll():
    from locations import locations
    for code, name in locations.items():
        if not Location.query.get(code):
            db.session.add(Location(code=code, name=name))
    db.session.commit()

@click.command()
@click.option('--t', default='group', help='Type of group')
@click.option('--name', default='', help='Name of group')
def grouplist(t, name):
    """List groups"""
    if name:
        sect_list(t, name)
    else:
        for gp in sorted(rd.smembers(t+'s')): sect_list(t, gp)

def sect_list(t, g):
    click.echo("%s\t%s" % (g, ' '.join(sorted(rd.smembers('%s:%s' % (t, g))))))

@click.command()
@click.argument('name')
@click.argument('members', nargs=-1)
def groupadd(name, members):
    """Add to group"""
    rd.sadd('groups', name)
    if len(members) == 1 and ':' in members[0]:
        members = tuple(rd.smembers(members[0]))
    rd.sadd('group:%s'%name, *members)

@click.command()
@click.option('--t', default='group', help='Type of group')
@click.argument('name')
@click.argument('members', nargs=-1)
def grouprem(t, name, members):
    """Remove from group"""
    if members:
        rd.srem('%s:%s' % (t, name), *members)
    else:
        rd.srem(t+'s', name)
        rd.delete('%s:%s' % (t, name))

@click.command()
@click.argument('sections', nargs=-1)
def lessonlist(sections):
    """List lessons"""
    classes = []
    for cn in sections:
        try:
            cn = int(cn)
        except ValueError:
            continue
        classes.append(cn)
    classes.sort()

    for cn in classes:
        for l in Lesson.query.filter_by(class_no=cn).all():
            click.echo((l.sn, l.start.isoformat(), l.component, l.location))

@click.command()
@click.option('--cn', default=1000, help='Class code')
@click.option('--sn', default=0, help='Lesson number')
@click.option('--loc', default='1.102', help='Lesson location')
def lessonmv(cn, sn, loc):
    """Change lesson location"""
    l = Lesson.query.filter_by(class_no=cn, sn=sn).first()
    tt = Location.query.get(loc)

    l.location = tt
    db.session.commit()

    #for cn in classes:
    #    for l in Lesson.query.filter_by(class_no=cn).all():
    #        click.echo((l.sn, l.start.isoformat(), l.component, l.location))

cli.add_command(runserver)
cli.add_command(resetdb)
cli.add_command(load_locations)
cli.add_command(grouplist)
cli.add_command(groupadd)
cli.add_command(grouprem)
cli.add_command(lessonlist)
cli.add_command(lessonmv)

if __name__ == '__main__':
    cli()
