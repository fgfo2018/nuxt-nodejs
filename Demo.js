var express = require('express') // web server 集成
var cors = require('cors') // 跨域請求
var app = express() // 宣告伺服器
const bodyParser = require('body-parser') // 接收post進來的data
var fs = require("fs"); // 可讀取本機資料
var url = require('url'); // 網址參數(GET) 讀取

app.use(bodyParser.text({
    type: '*/*'
}), cors())
// GET 基本讀取
app.get('/DEMO1', function (req, res, next) {
    var params = url.parse(req.url, true).query;
    var arr = []
    var spot1 = []
    for (var i = parseInt(params.start); i <= parseInt(params.stop); i++) {
        var lambda = 1;
        var amp = 42;
        var ftemp1 = (1 - Math.pow(Math.E, -lambda * i)) * amp;
        ftemp1 = ftemp1 + generateRandomInt(-1, 1);
        arr.push(i)
        spot1.push(ftemp1)
    }
    var data = [{
        time: arr,
        spot1: spot1,
        spot2: null
    }]
    console.log(params.start, params.stop)
    res.send(data)
})

function generateRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}
// POST接收
app.post('/DEMO2', (req, res) => {
    const DATA = JSON.parse(req.body)

    res.send(DATA)
})
// 本機存檔
const saveDEMO = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./object/spot.json', stringifyData)
}
// 本機資料讀取
const getDEMO = () => {
    const jsonData = fs.readFileSync('./object/spot.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}


app.listen(8888, function () {
    console.log("API啟動成功");
})