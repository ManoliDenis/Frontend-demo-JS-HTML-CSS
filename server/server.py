import time
import socket as sock
import _thread
import gzip

# constants
_debug = False
crlf = "\r\n"
page_found = "HTTP/1.1 200 OK" + crlf
page_not_found = "HTTP/1.1 404 NOT FOUND" + crlf

with open("../contents/index.html", "r", encoding='UTF-8') as index_file:
    content = index_file.read()
with open("../contents/css/style.css", "r", encoding='UTF-8') as css_file:
    content_css = css_file.read()
with open("../contents/js/script.js", "r", encoding='UTF-8') as js_file:
    content_js = js_file.read()
with open("../contents/imagini/logoFurat.svg", "rb") as svg_file:
    content_svg = svg_file.read()
with open("../contents/favicon.ico", "rb") as ico_file:
                content_ico = ico_file.read()
# functions
def process_message(method:str, uri: str):
    if method == "GET":
        if uri == "/":
            header = page_found + "Content-Type: text/html; charset=utf-8" + crlf +"Content-Encoding: gzip" +crlf + crlf
            return header.encode('utf-8') + gzip.compress(content.encode('utf-8'))
        
        elif uri.endswith(".css"):
            header = page_found + "Content-Type: text/css; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_css.encode('utf-8'))
        
        elif uri.endswith(".js"):
            header = page_found + "Content-Type: text/javascript; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_js.encode('utf-8'))
        
        elif uri.endswith(".svg"):
            header = page_found + "Content-Type: image/svg+xml" + crlf + crlf
            return header.encode('utf-8') + content_svg
        
        elif uri.endswith(".html"):
             with open("../contents"+uri, "r", encoding='UTF-8') as extra_file:
                content_extra = extra_file.read()
             header = page_found + "Content-Type: text/html; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
             return header.encode('utf-8') + gzip.compress(content_extra.encode('utf-8'))
        
        elif uri == "/favicon.ico":
            
            header = page_found + "Content-Type: image/x-icon" + crlf + crlf

            return header.encode('utf-8') + content_ico
        else:
            header = page_not_found + crlf
            return header.encode('utf-8')


def process_requests(connection : sock, address : any ):
        try :
        
            data =  connection.recv(1024)
            print('connection from', address)
            print('connected')

            
            request = data.decode()
            CRLF_position = request.find(crlf)
            request_header = request[0:CRLF_position]
            request_header_words = request_header.split()

            if len(request_header_words) <= 0 :
                 connection.close()
                 return
            
            print("HEADER:"+request_header)


            if request_header_words[0] == "GET":
                method, uri, ver = request_header_words[0:3]

                if _debug == True:
                    print('request:' + request[0:CRLF_position])
                    print('Type:' + method)
                    print('URI:' + uri)
                    print('HTTP version:' + ver)
                    print("Printing words:")
                connection.sendall(process_message(method, uri))
            connection.close()
        
        except Exception as e:
            connection.close()
            print('Connection closed')
            print('Reason:' ,e)
            time.sleep(20)

socket = sock.socket(sock.AF_INET, sock.SOCK_STREAM)
socket.bind(('localhost', 8081))
socket.listen(2)

while True:
    print('waiting for connection...')
    connection, address = socket.accept()
    _thread.start_new_thread(process_requests, (connection,address))



