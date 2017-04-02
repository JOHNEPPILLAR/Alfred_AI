//=========================================================
// Setup time skills
//=========================================================
const Skills       = require('restify-router').Router;  
      skill        = new Skills(),
      NodeGeocoder = require('node-geocoder'),
      options      = {
        provider: 'google',
        httpAdapter: 'https', 
        formatter: null         
      },
      geocoder     = NodeGeocoder(options),
      dateFormat   = require('dateformat');

//=========================================================
// Skill: whatisthetime
//=========================================================
function whatisthetime (req, res, next) {

    logger.info ('Time API called');

    // Get the location
    var location = '';
    if (typeof req.query.location !== 'undefined' && req.query.location !== null) {
        location = req.query.location;
    } else {
        location = 'london';
    };

    geocoder.geocode(location)
    .then(function(Data) {
        var lat = Data[0].latitude,
            lng = Data[0].longitude,
            url = 'http://api.geonames.org/timezoneJSON?lat=' + lat + '&lng=' + lng + '&username=' + process.env.geonames;
            alfredHelper.requestAPIdata(url)
            .then(function(apiData){
                returnMessage = 'The time in ' + location + ' is currently ' + dateFormat(apiData.body.time, "h:MM TT") + '.';
                alfredHelper.sendResponse(res, 'sucess', returnMessage);
            })
            .catch(function (err) {
                // Send response back to caller
                alfredHelper.sendResponse(res, 'error', err.message);
                logger.error('whatisthetime: ' + err);
            });
    })
    .catch(function(err) {
        // Send response back to caller
        alfredHelper.sendResponse(res, 'error', err);
        logger.error('whatisthetime: ' + err);
    });
    next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/whatisthetime', whatisthetime);

module.exports = skill;