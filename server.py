import re, os, http.server
from urllib.parse import urlsplit, parse_qs
from timetable import get_timetable

def get_params( qs ):

    p = {}
    q = parse_qs( qs )

    if not q:
        p['subject_codes'] = [ c.split('/') for c in qs.split(',') ]
    else:
        if 'codes' in q:
            codes = q['codes']
            if len(codes) == 1: codes = codes[0].split(',')
            p['subject_codes'] = [ c.split('/') for c in codes ]
        
    if 'subject_codes' not in p: p['subject_codes'] = []

    return p

def get_page( path ):
    try:
        with open( path, 'rb' ) as f: return f.read()
    except EnvironmentError:
        return None

class CalHandler( http.server.CGIHTTPRequestHandler ):

    cgi_directories = ['/']

    extensions_map = {
        '': 'application/octet-stream',
        'data': 'application/json',
        'js': 'application/javascript',
        'png': 'image/png',
        'css': 'text/css',
        'html': 'text/html',
        'ics': 'text/calendar',
    }

    def do_HEAD(s):
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()

    def do_GET(s):
        p = urlsplit( s.path )
        page = None

        if p.path == '/':
            page =  get_page( 'index.html' )
            ctype = s.extensions_map['html']

        elif p.path == '/ics':
            page = get_timetable( **get_params( p.query ) )
            ctype = s.extensions_map['ics']

        else:
            urls = re.match(r'/(js|css|data|png)/', p.path )
            if urls:
                page = get_page( p.path[1:] )
                ctype = s.guess_type( p.path )
                if p.path[-3:] == 'css': ctype = s.extensions_map['css']

        if page:
            s.send_response(200)
            s.send_header("Content-type", ctype)
            s.end_headers()
            s.wfile.write(page)
        else:
            s.send_error(404, "File not found")

def run( host='' ):
    port = os.getenv("PORT")
    port = 5000 if port is None else int(port)

    httpd = http.server.HTTPServer( ( host, port ), CalHandler )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run()
