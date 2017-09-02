//=========================================================
// Setup webcam skill
//=========================================================
const Skills = require('restify-router').Router;  
      dotenv = require('dotenv');
      skill  = new Skills()
      
//=========================================================
// Skill: Display stream
//=========================================================
function displayStream (req, res, next){
    
//    
// ***** WIP *****
//

    logger.info ('Webcam API called');
    
    const streamUrl = process.env.FOSCAM_STREAM_URL,
          socketio  = require('socket.io'),
          io        = socketio.listen(server.server),
          rtsp      = require('rtsp-ffmpeg'),
          stream    = new rtsp.FFMpeg({input: streamUrl, rate: 10, resolution: '640x480', quality: 3});

    io.on('connection', function(socket) {
        logger.info ("Started streaming ")
        
        var pipeStream = function(data) {
            socket.emit('data', data.toString('base64'));
        };

        stream.on('data', pipeStream);

        socket.on('disconnect', function() {
            stream.removeListener('data', pipeStream);
            logger.info("Stopped streaming")
        });
    });

    alfredHelper.sendResponse(res, 'sucess', 'streaming');
    
    next();
};

function a (req, res, next){
    
    var body = require('fs').readFileSync('index.html', 'utf8')
    
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'text/html'
    });
    res.write(body);
    res.end();

}

//=========================================================
// Add skills to server
//=========================================================
skill.get('/', displayStream);
skill.get('/a', a);

module.exports = skill;