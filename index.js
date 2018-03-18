const request = require("request");
var weather = require('weather-js');
const sensors = require("./sensors");
const dbOperations = require("./dbOperations");
const mqtt = require("mqtt");
const fs = require("fs");
var io = require("socket.io-client");
var allOff = false;
var serverUrl = "<your URI to web socket>";
var conn = io.connect(serverUrl);
var conn_opt = {
    host: "localhost",
    port: 1883
};
var timerForDark;
var interval = 180000;
var wait = 0;
var place = '411021';

weather.find({ search: place, degreeType: 'C' }, function(err, result) {
    if (err) console.log(err);
    report = result[0].current;
    var toSend = {
        weatherData: {
            weather: report.skytext,
            temp: report.temperature,
            humidity: report.humidity,
            wind: report.windspeed,
        },
        dht: sensors.dhtData(),
        cpu: sensors.getCpu(),
        updatedAt: new Date().toLocaleString()
    };
    dbOperations.addToDb(toSend);
    var optsData = {
        uri: "http://<Your IP>/api/data",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toSend)
    };
    request.post(optsData, function(err, response, body) {
        if (!err) console.log(JSON.parse(body).msg, toSend.updatedAt);
    });
});
setInterval(function() {
    weather.find({ search: place, degreeType: 'C' }, function(err, result) {
        if (err) console.log(err);
        report = result[0].current;
        var toSend = {
            weatherData: {
                weather: report.skytext,
                temp: report.temperature,
                humidity: report.humidity,
                wind: report.windspeed,
            },
            dht: sensors.dhtData(),
            cpu: sensors.getCpu(),
            updatedAt: new Date().toLocaleString()
        };
        dbOperations.addToDb(toSend);
        var optsData = {
            uri: "http://<your IP>/api/data",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(toSend)
        };
        request.post(optsData, function(err, response, body) {
            if (!err) console.log(JSON.parse(body).msg, toSend.updatedAt);
        });
    });
}, interval);
var client = mqtt.connect(conn_opt);
console.log("connected to websockets on: " + serverUrl);
console.log("connected to mqtt on: " + conn_opt.host);
Number.prototype.pwmMap = function() {
    return this * 1024 / 255;
};
conn.on("status", data => {
    if (fs.readFileSync("/sys/class/gpio/gpio25/value") == 0) {
        fs.writeFileSync("/sys/class/gpio/gpio25/value", 1);
        wait = 5000;
    } else {
        wait = 0;
    }
    setTimeout(() => {
        console.log(data);
        allOff == false;
        clearTimeout(timerForDark);
        if (data.mode.replace(/\s+/g, "").toUpperCase() == "PARTYMODE") {
            if (fs.readFileSync("/sys/class/gpio/gpio8/value") == 0)
                fs.writeFileSync("/sys/class/gpio/gpio8/value", 1);
            client.publish("musicSync", "rgb");
        } else if (
            data.mode.replace(/\s+/g, "").toUpperCase() == "SYNCMUSICTOCOLOR"
        ) {
            if (fs.readFileSync("/sys/class/gpio/gpio8/value") == 0)
                fs.writeFileSync("/sys/class/gpio/gpio8/value", 1);
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
            if (data.led.red == 0 && data.led.green == 0 && data.led.blue == 0 && data.led.white == 0 && data.led.yellow == 0) {
                console.log('All off');
                timerForDark = setTimeout(() => {
                    console.log('turning off the lights');
                    fs.writeFileSync("/sys/class/gpio/gpio25/value", 0);
                }, 180000);

            }
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
                0 + "," + 0 + "," + 0 + "," + (120).pwmMap() + "," + (255).pwmMap()
            );

        }
    }, wait);
});
conn.on("settings", data => {
    interval = data.interval;
    place = data.place;
    wait = data.wait;
});
conn.on("setSpeakers", data => {
    console.log(data);
    if (data.status) fs.writeFileSync("/sys/class/gpio/gpio8/value", 1);
    else fs.writeFileSync("/sys/class/gpio/gpio8/value", 0);
});