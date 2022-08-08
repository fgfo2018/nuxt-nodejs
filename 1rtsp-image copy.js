var fs = require("fs");
filename = "./config.json";
let rawdata = fs.readFileSync(filename);
let config = JSON.parse(rawdata);
const app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(6147, {
        cors: {
            // No CORS at all
            origin: '*',
        }
    });
rtsp = require('rtsp-ffmpeg');
console.log("啟動rtps轉換程式中");
// server.listen(6147);

console.log("rtps轉換程式WEB已啟用，等待轉換程式啟動");
var uri = config.stream_url ,
    stream = new rtsp.FFMpeg({
        input: uri,
        rate: config.stream_fps,
        resolution: config.stream_resolution,
        quality: config.stream_quality
    });
stream.cmd = '.\\ffmpeg\\bin\\ffmpeg.exe';
io.on('connection', function (socket) {
    var pipeStream = function (data) {
        socket.emit('data', data.toString('base64'));
    };
    stream.on('data', pipeStream);
    socket.on('disconnect', function () {
        stream.removeListener('data', pipeStream);
    });
    socket.on("ping", (count) => {
        console.log(count);
    });
});
// server.listen(3000, function () {
// console.log('listening on *:3000');
// });
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    // var port = server.address().port;
    console.log("rtps輸出");
});