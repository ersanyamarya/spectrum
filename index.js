var io = require('socket.io-client');
var serverUrl = 'http://localhost:9090/ws';
var conn = io.connect(serverUrl);
conn.on("status", data => {
    console.log(data.mode);
    if (data.mode == 'partyMode') {

    } else if (data.mode == 'syncToColor') {

    } else if (data.mode == 'colorMyRoom') {

    } else if (data.mode == 'readMode') {

    }
});