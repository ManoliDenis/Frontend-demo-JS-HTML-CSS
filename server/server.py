import time
import socket as sock

# constants
crlf = "\r\n"
page_found = "HTTP/1.1 200 OK" + crlf
page_not_found = "HTTP/1.1 404 NOT FOUND" + crlf

# functions
 def process_message(method, uri):
     if method == "GET" and uri == "/":
        return page_found
     else:
         return page_not_found



socket = sock.socket(sock.AF_INET, sock.SOCK_STREAM)
socket.bind(('localhost', 8081))
socket.listen(2)
print('waiting for connection...')
connection, address = socket.accept()
print('connection from', address)
print('connected')
print('sending message to all users...')
#connection.sendall(post_message.encode())
print('sent')

while True:
    try :

        data =  connection.recv(1024)
        request = data.decode()
        CRLF_position = request.find(crlf)
        request_words = request.split()
        method, uri, ver = request_words[0:3]

        print('request:' + request[0:CRLF_position])
        print('Type:' + method)
        print('URI:' + uri)
        print('HTTP version:' + ver)



    except Exception:
        connection.close()
        print('Connection closed')
        print('Reason:' + Exception.args[0])
        time.sleep(20)
