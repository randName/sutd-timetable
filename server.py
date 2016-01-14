import http.server

class CalHandler( http.server.SimpleHTTPRequestHandler ):

    def do_HEAD(s):
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()

    def do_GET(s):
        s.send_response(200)
        s.send_header("Content-type", "text/html")
        s.end_headers()
        page = "<html><head><title>t</title></head><body>%s</body></html>" % s.path
        s.wfile.write(page.encode())

def run( host='', port=5000 ):
    httpd = http.server.HTTPServer( ( host, port ), CalHandler )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == '__main__':
    run()
