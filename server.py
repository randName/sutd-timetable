import os, http.server
from urllib.parse import urlsplit, parse_qs

from timetable import get_timetable

def get_params( qs ):

    p = {}
    q = parse_qs( qs )

    if not q:
        p['subject_codes'] = qs.split(',')
    else:
        if 'codes' in q:
            codes = q['codes']
            if len(codes) == 1: codes = codes[0].split(',')
            p['subject_codes'] = codes
        
    if 'subject_codes' not in p: p['subject_codes'] = []

    return p

class CalHandler( http.server.SimpleHTTPRequestHandler ):

    def do_HEAD(s):
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()

    def do_GET(s):
        p = urlsplit( s.path )

        if p.path == '/ics':
            s.send_response(200)
            s.send_header("Content-type", "text/calendar")
            s.end_headers()

            cal = get_timetable( **get_params( p.query ) )
            s.wfile.write(cal)

        else:
            if p.path == '/':
                with open( 'index.html' ) as f: page = f.read()
            else:
                s.send_error(404)

            s.send_response(200)
            s.send_header("Content-type", "text/html")
            s.end_headers()
            s.wfile.write(page.encode())

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
