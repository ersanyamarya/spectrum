const Influx = require("influxdb-nodejs");
const client = new Influx("http://127.0.0.1:8086/dataghost");

const fieldSchema = {
    weather: "s",
    aTemp: "f",
    aHumidity: "f",
    aPressure: "f",
    windSpeed: "f",
    windDeg: "f",
    clouds: "f",
    rTemp: "f",
    rHumidity: "f",
    fanStatus: "b",
    cpuTemp: "f",
    totalmem: "f",
    usedmem: "f",
    freemem: "f"
};
const tagSchema = {
    platform: "*",
    release: "*"
};
client.schema("logs", fieldSchema, tagSchema, {
    // default is false
    stripUnknown: true
});
module.exports.addToDb = data => {
    client.write('logs')
        .tag({
            platform: data.cpu.platform,
            release: data.cpu.release
        })
        .field({
            weather: data.weatherData.weather,
            aTemp: data.weatherData.temp,
            aHumidity: data.weatherData.humidity,
            aPressure: data.weatherData.pressure,
            windSpeed: data.weatherData.wind.speed,
            windDeg: data.weatherData.wind.deg,
            clouds: data.weatherData.clouds,
            rTemp: data.dht.temp,
            rHumidity: data.dht.humidity,
            fanStatus: data.cpu.fanStatus,
            cpuTemp: data.cpu.cpuTemp,
            totalmem: data.cpu.totalmem,
            usedmem: data.cpu.usedmem,
            freemem: data.cpu.freemem,
        })
        .then(() => console.info('added to DB'))
        .catch(console.error);
};