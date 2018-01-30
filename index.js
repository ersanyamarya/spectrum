var io = require("socket.io-client");
var serverUrl = "<IpOfYourServerWithWebSocket>";
var conn = io.connect(serverUrl);
const mqtt = require("mqtt");
var conn_opt = {
    host: "localhost",
    port: 1883
};
var client = mqtt.connect(conn_opt);
console.log('connected to websockets on: ' + serverUrl);
console.log('connected to mqtt on: ' + conn_opt.host);


Number.prototype.pwmMap = function() {
    return this * 1024 / 255;
};

conn.on("color", data => {
    console.log(data);

});

conn.on("status", data => {
    console.log(data);
    if (data.mode.replace(/\s+/g, "").toUpperCase() == "PARTYMODE") {
        client.publish("musicSync", "rgb");
    } else if (data.mode.replace(/\s+/g, "").toUpperCase() == "SYNCTOCOLOR") {
        client.publish(
            "musicSyncRGB",
            data.led.red.pwmMap() +
            "," +
            data.led.green.pwmMap() +
            "," +
            data.led.blue.pwmMap() +
            "," +
            data.led.white.pwmMap() +
            "," +
            data.led.yellow.pwmMap()
        );
    } else if (data.mode.replace(/\s+/g, "").toUpperCase() == "COLORMYROOM") {
        client.publish(
            "lightCommands",
            data.led.red.pwmMap() +
            "," +
            data.led.green.pwmMap() +
            "," +
            data.led.blue.pwmMap() +
            "," +
            data.led.white.pwmMap() +
            "," +
            data.led.yellow.pwmMap()
        );
    } else if (data.mode.replace(/\s+/g, "").toUpperCase() == "READMODE") {
        client.publish(
            "lightCommands",
            0 +
            "," +
            0 +
            "," +
            0 +
            "," +
            (120).pwmMap() +
            "," +
            (255).pwmMap()
        );
    }
});