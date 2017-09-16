//=========================================================
// Setup webcam stream
//=========================================================
const socketio = require('socket.io'),
      dotenv   = require('dotenv'),
      rtsp     = require('rtsp-ffmpeg');

dotenv.load() // Load env vars

exports.setupStream = function(server) {

    const io = socketio.listen(server.server);
    
    logger.info ('Setting up webcam stream');

    var cams = [
		process.env.webcamUrl
	].map(function(uri, i) {
		var stream = new rtsp.FFMpeg({input: uri, resolution: '320x240', quality: 3});
		stream.on('start', function() {
			logger.info('stream ' + i + ' started');
		});
		stream.on('stop', function() {
			logger.info('stream ' + i + ' stopped');
		});
		return stream;
	});

    cams.forEach(function(camStream, i) {
        var ns = io.of('/cam' + i);
        ns.on('connection', function(wsocket) {
            logger.info('Connection request to /cam' + i);
            var pipeStream = function(data) {
                wsocket.emit('data', data);
            };
            camStream.on('data', pipeStream);

            wsocket.on('disconnect', function() {
                logger.info('Client disconnected from /cam' + i);
                camStream.removeListener('data', pipeStream);
            });
        });
    });

    io.on('connection', function(socket) {
        socket.emit('start', cams.length);
    });
    
};
