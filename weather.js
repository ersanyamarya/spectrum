var weather = require('weather-js');

// Options: 
// search:     location name or zipcode 
// degreeType: F or C 

weather.find({ search: '411021', degreeType: 'C' }, function(err, result) {
    if (err) console.log(err);

    console.log(JSON.stringify(result[0].current, null, 2));
});