var fs = require("fs");
filename = "./config.json";
var cors = require('cors')
const bodyParser = require('body-parser')
let rawdata = fs.readFileSync(filename);
var express = require('express');
const e = require("cors");
var app = express()
const io = require('socket.io')(6147, {
    cors: {
        // No CORS at all
        origin: '*',
    }
});
rtsp = require('rtsp-ffmpeg');
console.log("啟動rtps轉換程式中");
console.log("rtps轉換程式WEB已啟用，等待轉換程式啟動");
app.use(bodyParser.text({
    type: '*/*'
}), cors())

// 暫時關閉
// var arr = getCamL()
// var cam = []
// arr.forEach((index) => {
//     cam.push(index);
// })
// var cams = cam.map(function (uri, i) {
//     var stream = new rtsp.FFMpeg({
//         input: uri.cam,
//     });
//     stream.on('start', function () {
//         console.log('stream ' + i + ' started');
//     });
//     stream.on('stop', function () {
//         console.log('stream ' + i + ' stopped');
//     });
//     return stream;
// });

// cams.forEach(function (camStream, i) {
//     console.log(cam[i].proxy)
//     var ns = io.of("/" + cam[i].proxy);
//     ns.on('connection', function (wsocket) {
//         console.log('connected to ' + cam[i].proxy);
//         var pipeStream = function (data) {
//             wsocket.emit('data', data.toString('base64'));
//         };
//         camStream.on('data', pipeStream);

//         wsocket.on('disconnect', function () {
//             console.log('disconnected from ' + cam[i].proxy);
//             camStream.removeListener('data', pipeStream);
//         });
//     });
// });

// io.on('connection', function (socket) {
//     socket.emit('start', cams.length);
// });
// console.log("updata")
// 暫時關閉

// }, 1000)

// io.on('connection', (socket) => {
//     var arr = getDEMO()
//     console.log('connection')
//     console.log(socket.id)
//     arr.forEach((index, val) => {
//         var tmpname = null
//         var uri = index.cam,
//             tmpname = new rtsp.FFMpeg({
//                 input: uri,
//                 rate: 30,
//                 resolution: config.stream_resolution,
//                 quality: config.stream_quality
//             });
//         // [val].cmd = '.\\ffmpeg\\bin\\ffmpeg.exe';
//         var pipeStream = function (data) {
//             socket.emit('data' + val, data.toString('base64'));
//         };
//         tmpname.on('data', pipeStream);
//         socket.on('disconnect', function () {
//             console.log('stop')
//             tmpname.removeListener('data', pipeStream);
//         });
//     })
// });
var arr = {
    x: 0,
    y: 0
};
io.on("connection", (socket) => {
    console.log('user connected')
    // 建立一個 "sendMessage" 的監聽
    io.emit("allMessage", arr)
    socket.on("sendMessage", function (message) {
        console.log(message)
        arr.x = message.x
        arr.y = message.y
        // 當收到事件的時候，也發送一個 "allMessage" 事件給所有的連線用戶
        io.emit("allMessage", arr)
    })
})
var streamList = []
// 接收要直播的資訊
app.get('/test', (req, res) => {
    res.send({
        txt: 'Hello World'
    })
})
app.post('/test', (req, res) => {
    res.send({
        txt: 'Hello World'
    })
})
app.post('/stream', (req, res) => {
    const data = JSON.parse(req.body)
    data.forEach((index) => {
        const found = streamList.find(element => element.proxy === index.proxy)
        if (found === undefined) {
            console.log("本次新增:" + index.proxy)
            streamList.push(index)
            var totle = streamList.length
            console.log("總共有:" + totle)
            // 新增直播
            var ip = [index.rtsp].map(function (uri) {
                var stream = new rtsp.FFMpeg({
                    input: uri,
                    rate: 30,
                    // resolution:'960x540',
                    // resolution: '854x480',
                    quality: 1
                });

                stream.on('start', function () {
                    var data = `[Proxy][${mToday()}]:Proxy for ${index.rtsp} `
                    saveLogData(data)
                    console.log('stream ' + totle + ' started');
                });
                stream.on('stop', function () {
                    console.log('stream ' + totle + ' stopped');
                });
                return stream;
            });
            ip.forEach(function (camStream, i) {
                var ns = io.of('/' + index.proxy);
                ns.on('connection', function (wsocket) {
                    var pipeStream = function (data) {
                        wsocket.emit('data', data.toString('base64'));
                    };
                    camStream.on('data', pipeStream);
                    wsocket.on('disconnect', function () {
                        camStream.removeListener('data', pipeStream);
                    });
                });

            })
            io.on('connection', function (socket) {
                socket.emit('start', totle);
            });
        }
    })
    console.log(streamList)
    res.send(data)
})
app.get('/time', (req, res) => {
    var index = fs.readFileSync('time.html');
    res.end(index);
})

app.get('/cameraList', (req, res) => {
    var output = getDEMO()
    res.send(output)
})

// var totle = cams.length
app.post('/add', (req, res) => {
    const DATA = JSON.parse(req.body) // 新相機資訊
    var output = getDEMO() // 讀取JSON
    var found = undefined
    var proxy = DATA.proxy
    if (DATA.proxy === null) {
        proxy = _uuid()
    } else {
        found = output.find(element => element.proxy === DATA.proxy) // 查詢proxy是否有重複
    }
    if (found === undefined) {
        output.push({
            cam: DATA.ip,
            proxy: proxy
        })
        saveDEMO(output)
        res.send({
            status: '200'
        })
    } else {
        res.send({
            status: '403'
        })
    }
    // 將新相機資訊存入JSON中

    // 新增相機 保存至記憶體
    // var ip = [DATA.ip].map(function (uri, i) {
    //     var stream = new rtsp.FFMpeg({
    //         input: uri,
    //     });
    //     stream.on('start', function () {
    //         console.log('stream ' + totle + ' started');
    //     });
    //     stream.on('stop', function () {
    //         console.log('stream ' + totle + ' stopped');
    //     });
    //     return stream;
    // });
    // ip.forEach(function (camStream, i) {
    //     var ns = io.of('/cam' + totle);
    //     ns.on('connection', function (wsocket) {
    //         console.log('connected to /cam' + totle);
    //         var pipeStream = function (data) {
    //             wsocket.emit('data', data.toString('base64'));
    //         };
    //         camStream.on('data', pipeStream);

    //         wsocket.on('disconnect', function () {
    //             console.log('disconnected from /cam' + totle);
    //             camStream.removeListener('data', pipeStream);
    //         });
    //     });
    // })
    // io.on('connection', function (socket) {
    //     socket.emit('start', totle);
    // });
    // console.log(ip)
    // // console.log(cams)
    // totle = totle + 1
})

app.listen(6148, function () {
    console.log("API啟動成功");
})
// 本機存檔
const saveDEMO = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./object/cam.json', stringifyData)
}
// 本機資料讀取
const getDEMO = () => {
    const jsonData = fs.readFileSync('./object/cam.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}

function getCamL() {
    const jsonData = fs.readFileSync('./object/cam.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}

function _uuid() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
var arr = []

function saveLogData(content) {
    arr.push(content)
    console.log(arr)
}
var pustatus = true
setInterval(() => {
    if (arr.length > 0 && pustatus) {
        pustatus = false
        var tp = putLOG(arr[0])
        arr.shift();
        pustatus = tp
    }
}, 200)

function putLOG(content) {
    const path = './log.txt'
    try {
        if (!fs.existsSync(path)) {
            fs.writeFile(path, '', function (error) {
                console.log(error)
                console.log('create log.txt')
            })
        }
    } catch (err) {
        console.error(err)
    }
    var data = fs.readFileSync(path).toString().split("\n");
    data.splice(-1, 0, content);
    var text = data.join("\n");
    fs.writeFile(path, text, function (err) {
        if (err) return console.log(err);
    });
    return true;
}
var system1 = `系統在[${mToday()}]啟動`
saveLogData(system1)
setInterval(() => {
    var data = `[OK][${mToday()}]:System is normal`
    saveLogData(data)
}, 0.1 * 60 * 1000)

function mToday() {
    var m = new Date().toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei'
    });
    return m;
}
var exit1 = false;
process.on('SIGINT', () => {
    var data = `[exit][${mToday()}]:程序退出`
    exit1 = putLOG(data)
    setInterval(() => {
        if (exit1) {
            process.exit(0);
        }
    }, 10)
})