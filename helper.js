'use strict';
const rp = require('request-promise');

//=========================================================
// Call a remote API to get data
//=========================================================
exports.requestAPIdata = function (apiURL, userAgent) {
    var options = {
        'User-Agent': userAgent,
        method: 'GET',
        uri: apiURL,
        resolveWithFullResponse: true,
        json: true
    }
    return rp(options);
};

//=========================================================
// Misc
//=========================================================
exports.isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        };
    };
    return true;
};

exports.addDays = function (date, amount) {
    var tzOff = date.getTimezoneOffset() * 60 * 1000,
        t = date.getTime(),
        d = new Date(),
        tzOff2;

    t += (1000 * 60 * 60 * 24) * amount;
    d.setTime(t);

    tzOff2 = d.getTimezoneOffset() * 60 * 1000;
    if (tzOff != tzOff2) {
        var diff = tzOff2 - tzOff;
        t += diff;
        d.setTime(t);
    };
    return d;
};


