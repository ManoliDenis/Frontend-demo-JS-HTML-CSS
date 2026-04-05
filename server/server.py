import time
import socket as sock
import _thread
import gzip
import json

# constants
_debug = False
crlf = "\r\n"
page_found = "HTTP/1.1 200 OK" + crlf
page_not_found = "HTTP/1.1 404 NOT FOUND" + crlf


with open("../contents/css/style.css", "r", encoding='UTF-8') as css_file:
    content_css = css_file.read()
with open("../contents/imagini/logoFurat.svg", "rb") as svg_file:
    content_svg = svg_file.read()
with open("../contents/favicon.ico", "rb") as ico_file:
    content_ico = ico_file.read()
# functions
def get_main(html_file : str):
     first_main = html_file.find("<main>")
     last_main = html_file.find("</main>")
     body_main = html_file[first_main:last_main+7]
     body_main = body_main[6:len(body_main)-1-6]
     if _debug == True:
        print("\n\n ",body_main,"\n\n\n")

     return body_main
def process_message(method:str, uri: str):
    if method == "GET":
        if uri == "/":
            with open("../contents/index.html", "r", encoding='UTF-8') as index_file:
              content = index_file.read()
            header = page_found + "Content-Type: text/html; charset=utf-8" + crlf +"Content-Encoding: gzip" +crlf + crlf
            return header.encode('utf-8') + gzip.compress(content.encode('utf-8'))
        
        elif uri.endswith(".css"):
            header = page_found + "Content-Type: text/css; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_css.encode('utf-8'))
        
        elif uri.endswith(".js"):
            with open("../contents"+uri, "r", encoding='UTF-8') as extra_file_js:
                content_extra_js = extra_file_js.read()
            header = page_found + "Content-Type: text/javascript; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_extra_js.encode('utf-8'))
        
        elif uri.endswith(".svg"):
            header = page_found + "Content-Type: image/svg+xml" + crlf + crlf
            return header.encode('utf-8') + content_svg
        
        elif uri.endswith(".html"):
             with open("../contents"+uri, "r", encoding='UTF-8') as extra_file:
                content_extra = extra_file.read()
             content_extra = get_main(content_extra)
             header = page_found + "Content-Type: text/html; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
             return header.encode('utf-8') + gzip.compress(content_extra.encode('utf-8'))
        
        elif uri == "/favicon.ico":
            
            header = page_found + "Content-Type: image/x-icon" + crlf + crlf

            return header.encode('utf-8') + content_ico
        
        elif uri.endswith(".xml"):
            with open("../contents" + uri, "r", encoding='UTF-8') as file_xml:
                content_xml = file_xml.read()
            header = page_found + "Content-Type: application/xml; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_xml.encode('utf-8'))
        elif uri.endswith(".dtd"):
            with open("../contents" + uri, "r", encoding='UTF-8') as file_dtd:
                content_dtd = file_dtd.read()
            header = page_found + "Content-Type: application/xml; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_dtd.encode('utf-8'))
        
        elif uri.endswith(".json"):
            with open("../contents" + uri, "r", encoding='UTF-8') as file_json:
                content_json = file_json.read()
            header = page_found + "Content-Type: application/json; charset=utf-8" +crlf +"Content-Encoding: gzip" + crlf + crlf
            return header.encode('utf-8') + gzip.compress(content_json.encode('utf-8'))
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
            connection.sendall(process_message(method, uri))
            
        elif request_header_words[0] == "POST":
            method, uri, ver = request_header_words[0:3]
            if uri == "/api/utilizatori":
                parts = request.split(crlf + crlf, 1)
                body = parts[1] if len(parts) > 1 else ""
                
                try:
                    with open("../contents/resurse/utilizatori.json", "r", encoding="utf-8") as f:
                        utilizatori = json.loads(f.read())
                except:
                    utilizatori = []
                    
                if body:
                    date_noi = json.loads(body)
                    utilizatori.append(date_noi)
                    
                    with open("../contents/resurse/utilizatori.json", "w", encoding="utf-8") as f:
                        f.write(json.dumps(utilizatori))
                        
                raspuns = page_found + "Content-Type: text/plain" + crlf + crlf + "Inregistrat cu succes"
                connection.sendall(raspuns.encode('utf-8'))
                
        connection.close()
    
    except Exception as e:
        connection.close()
        print('Connection closed')
        print('Reason:' ,e)
        time.sleep(20)
socket = sock.socket(sock.AF_INET, sock.SOCK_STREAM)
socket.bind(('localhost', 5454))
socket.listen(2)

while True:
    print('waiting for connection...')
    connection, address = socket.accept()
    _thread.start_new_thread(process_requests, (connection,address))



