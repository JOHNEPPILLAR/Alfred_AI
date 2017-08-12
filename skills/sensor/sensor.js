//=========================================================
// Setup sensor skill
//=========================================================
const Skills = require('restify-router').Router;  
      skill  = new Skills(),
      HueApi = require("node-hue-api").HueApi,
      dotenv = require('dotenv');

dotenv.load() // Load env vars

const HueBridgeIP   = process.env.HueBridgeIP,
      HueBridgeUser = process.env.HueBridgeUser,
      Hue           = new HueApi(HueBridgeIP, HueBridgeUser);

//=========================================================
// Skill: Display sensor status
//=========================================================
function sensorStatus (req, res, next){

logger.info ('Sensor Status API called');

return getSensorState(res)

    async function getSensorState(res) {
        try {
            var sensor = await Hue.sensors()
            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'sucess', sensor); // Send response back to caller
            };
            return sensor;
        } catch(err) {
            if (typeof res !== 'undefined' && res !== null) {
                alfredHelper.sendResponse(res, 'error', err); // Send response back to caller
            };
            logger.info('Get Sensor State: ' + err);
            return err;
        };
    };

next();
};

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', sensorStatus);

module.exports = skill;