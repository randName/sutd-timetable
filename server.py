import os, http.server
from urllib.parse import urlsplit, parse_qs

from timetable import get_timetable

class CalHandler( http.server.SimpleHTTPRequestHandler ):

    def do_HEAD(s):
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()

    def do_GET(s):
        p = urlsplit( s.path )

        if p.path == '/':
            with open( 'index.html' ) as f: page = f.read()

        elif p.path == '/ics':
            q = parse_qs( p.query )
            if not q:
                codes = p.query
            else:
                codes = q.get('codes',[''])
                if len(codes) == 1: codes = codes[0]
                
            codes = codes.split(',')

            s.send_response(200)
            s.send_header("Content-type", "text/calendar")
            s.end_headers()
            cal = get_timetable( codes )
            s.wfile.write(cal)
        else:
            page = "<html><head><title>error</title></head><body>%s</body></html>" % repr(p)

        if page:
            s.send_response(200)
            s.send_header("Content-type", "text/html")
            s.end_headers()
            s.wfile.write(page.encode())
        else:
            s.send_response(404)
            s.send_header("Content-type", "text/html")
            s.end_headers()
            page = "<html><head><title>error</title></head><body>404</body></html>"
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
