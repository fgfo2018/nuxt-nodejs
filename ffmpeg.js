var express = require('express');
var app = express();
var router = express.Router();
var fs = require("fs");
const {
    createFFmpeg,
    fetchFile
} = require('@ffmpeg/ffmpeg');
const ffmpeg = createFFmpeg({
    log: true
});

// function testffmpeg() {
//     console.log("123");
// }
// testffmpeg();

(async () => {
    await ffmpeg.load();
    // ffmpeg.FS('writeFile', 'test.avi', await fetchFile('./test.avi'));
    // await ffmpeg.run('-i', 'test.avi', 'test.mp4');
    await ffmpeg.run('-i', 'rtsp://192.168.0.181/avc','-f','img.jpg');
    // await fs.promises.writeFile('./img.jpg', ffmpeg.FS('readFile', 'img.jpg'));
    // process.exit(0);
})();