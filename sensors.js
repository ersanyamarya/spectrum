const sensorLib = require("node-dht-sensor");
const os = require("os");
const fs = require("fs");
var fan = false;
module.exports.dhtData = () => {
    var data = {
        temp: 0,
        humidity: 0
    };
    var initializeStatus = sensorLib.initialize(11, 23);
    if (initializeStatus) {
        var readout = sensorLib.read();
        data.temp = readout.temperature;
        data.humidity = readout.humidity;
        return data;
    } else {
        console.warn("Failed to initialize sensor");
        return data;
    }
};
module.exports.getCpu = () => {
    var data = {};
    var cpuTemp = Number(
        fs.readFileSync("/sys/class/thermal/thermal_zone0/temp").toString()
    );
    if (cpuTemp > 42000) fs.writeFileSync("/sys/class/gpio/gpio14/value", 1);
    if (cpuTemp < 38000) fs.writeFileSync("/sys/class/gpio/gpio14/value", 0);

    data.fanStatus = (fs.readFileSync("/sys/class/gpio/gpio14/value") == 1) ? true : false
    data.cpuTemp = cpuTemp;
    data.totalmem = (os.totalmem() / 1024 / 1024).toFixed(3);
    data.freemem = (os.freemem() / 1024 / 1024).toFixed(3);
    data.usedmem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(3);
    data.platform = os.platform();
    data.release = os.release();
    data.speakerStatus = (fs.readFileSync("/sys/class/gpio/gpio8/value") == 1) ? true : false
    return data;
};