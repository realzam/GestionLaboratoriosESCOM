var HOST = location.origin.replace(/^http/, 'ws')
let message=document.getElementById('message');
let username=document.getElementById('username');
let btn=document.getElementById('send');
let output=document.getElementById('output');
let actions=document.getElementById('actions');
    function connect()  {
        console.log('connect with ws');
        var socket = new WebSocket(HOST);
        socket.timeoutInterval = 3000;
            socket.onopen=function(event){
                console.log(event) 
                      
            }
            btn.addEventListener('click',function () {
                console.log(
                    username.value,
                    message.value
                );
                var user={
                    username:username.value,
                    message:message.value
                }
                var myJSON = JSON.stringify(user);
                if(socket.readyState==1)
                socket.send(message.value);  
            })
            
            socket.onclose = function(evt) { 
                setTimeout(connect,3000)
                };
    }
    connect()