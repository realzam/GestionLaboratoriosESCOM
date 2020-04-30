var HOST = location.origin.replace(/^http/, 'ws')
var socket = new WebSocket(HOST);

let message=document.getElementById('message');
let username=document.getElementById('username');
let btn=document.getElementById('send');
let output=document.getElementById('output');
let actions=document.getElementById('actions');
    //var sock=new WebSocket("ws://localhost:3000");
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
        socket.send(myJSON );

    })



    /*
    sock.onopen=function(event){
        console.log(event) 
              
    }
   
    sock.onmessage=function(event)
    {
        console.log('1');
        console.log('1');
        console.log('1');
        console.log('1');
        console.log('1');
        console.log('1');
        console.log(event);
        log.innerHTML+=event.data+"<br>";  
    }
    document.querySelector('button').onclick=function(){

        var text=document.getElementById("text").value;
        sock.send(text);
    };*/