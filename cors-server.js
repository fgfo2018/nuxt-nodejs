var express = require('express')
var cors = require('cors')
var app = express()
const bodyParser = require('body-parser')
var fs = require("fs");
var url = require('url');
const e = require('cors');

app.use(bodyParser.text({
    type: '*/*'
}), cors())

var log = 0;
app.get('/nodejsApi/addspot', function (req, res, next) {
    output = defaultArray();
    var params = url.parse(req.url, true).query;
    if (params.name !== undefined) {
        output["status"] = 200
        output['name'] = params.name
    } else {
        output.status = 400
    }
    res.write(JSON.stringify(output))
    res.end();
    console.log("(" + log + ")" + JSON.stringify(output));
    log = log + 1;
})
// 取得物件資料資料
var xxx = 0
app.get('/api/monitor/object/data', (req, res) => {
    var data = []
    var spot = getSpotsData()
    var scope = getScopesData()
    var line = getLinesData()
    // spot.sort(function (a, b) {
    //     return a.name - b.name
    // })
    data = {
        spot: spot,
        scope: scope,
        line: line
    }
    res.send(data)
    // console.log(xxx)
    xxx++
})
// 新增"點"資料
app.post('/api/monitor/object/add/spot', (req, res) => {
    var status = true;
    const stops = getSpotsData()
    console.log(stops.length)
    var totle = 0
    if (stops.length === 0) {
        totle = 0
    } else if (stops.length >= 6) {
        status = false;
    } else {
        totle = stops.length
    }
    if (status) {
        var spotsum = 0
        if (stops.length === 0) {
            spotsum = totle + 1
        } else {
            var testarray = []
            stops.forEach(function (element) {
                testarray.push(element.spot_number)
            })
            spotsum = spotsum + 1
            while (testarray.includes(spotsum)) {
                spotsum = spotsum + 1
            }
        }
        var locationX = (20 + spotsum * 20) / 640
        var locationY = (20 + spotsum * 20) / 480
        locationX = locationX.toFixed(4)
        locationY = locationY.toFixed(4)
        var todate = new Date();
        let date = "0" + todate.getDate();
        let month = "0" + (todate.getMonth() + 1);
        let year = todate.getFullYear();
        var hours = todate.getHours()
        var minutes = "0" + todate.getMinutes()
        var seconds = "0" + todate.getSeconds()
        var formattedTime = "spot_" + year + month.substr(-2) + date.substr(-2) + "_T" + hours + minutes.substr(-2) + seconds.substr(-2) + "_001";
        var newArray = {
            "spot_number": spotsum,
            "spot_temperature": 23,
            "spot_position": {
                "x": locationX,
                "y": locationY
            },
            "spot_alarm_status": 0,
            "spot_threshold": 20
        }
        stops.push(newArray)
        stops.sort(function (a, b) {
            return a.spot_number - b.spot_number
        })
        saveSpotData(stops);
    }
    res.send({
        success: true,
        //     msg: 'User data added successfully'
    })
})

// 編輯"點"資料
app.post('/api/monitor/object/change/spot', (req, res) => {
    const SpotData = JSON.parse(req.body)
    const existSpots = getSpotsData()
    if (SpotData.status === "0") {
        var testarray = []
        existSpots.forEach(function (element) {
            testarray.push(element.spot_number)
        })
        inquire = testarray.indexOf(SpotData.spot_number);
        if (SpotData.spot_position !== undefined) {
            existSpots[inquire].spot_position.x = SpotData.spot_position.x
            existSpots[inquire].spot_position.y = SpotData.spot_position.y
        }
        if (SpotData.spot_alarm_status !== undefined || SpotData.spot_threshold !== undefined) {
            existSpots[inquire].spot_alarm_status = SpotData.spot_alarm_status
            existSpots[inquire].spot_threshold = SpotData.spot_threshold
        }
        console.log(SpotData.spot_alarm_status)
        saveSpotData(existSpots)
    } else if (SpotData.status === "1") {
        var testarray = []
        existSpots.forEach(function (element) {
            testarray.push(element.spot_number)
        })
        inquire = testarray.indexOf(SpotData.spot_number);
        existSpots.splice(inquire, 1)
        console.log(inquire)
        if (inquire !== -1) {
            saveSpotData(existSpots)
        }
    }
    res.send({
        success: true,
    })
})

// 新增"範圍"資料
app.post('/api/monitor/object/add/scope', (req, res) => {
    var status = true;
    const scopes = getScopesData()
    console.log(scopes)
    var totle = 0
    if (scopes.length === 0) {
        totle = 0
    } else if (scopes.length >= 6) {
        status = false;
    } else {
        totle = scopes.length
    }
    if (status) {
        var scopessum = 0
        if (scopes.length === 0) {
            scopessum = totle + 1
        } else {
            var testarray = []
            scopes.forEach(function (element) {
                testarray.push(element.scope_number)
            })
            scopessum = scopessum + 1
            while (testarray.includes(scopessum)) {
                scopessum = scopessum + 1
            }
        }
        var locationX = (20 + scopessum * 20) / 640
        var locationY = (20 + scopessum * 20) / 480
        var locationX1 = (120 + scopessum * 20) / 640
        var locationY1 = (120 + scopessum * 20) / 480
        locationX = locationX.toFixed(4)
        locationY = locationY.toFixed(4)
        var newArray = {
            "scope_number": scopessum,
            "scope_temperature_max": 23,
            "scope_position_LT": {
                "x": locationX,
                "y": locationY
            },
            "scope_position_BR": {
                "x": locationX1,
                "y": locationY1
            },
            "scope_alarm_status": 0,
            "scope_threshold": 20
        }
        scopes.push(newArray)
        scopes.sort(function (a, b) {
            return a.scope_number - b.scope_number
        })
        saveScopeData(scopes);
    }
    res.send({
        success: true,
        //     msg: 'User data added successfully'
    })
})
// 編輯"範圍"資料
app.post('/api/monitor/object/change/scope', (req, res) => {
    const ScopeData = JSON.parse(req.body)
    const existScope = getScopesData()
    if (ScopeData.status === "0") {
        var testarray = []
        existScope.forEach(function (element) {
            testarray.push(element.scope_number)
        })
        inquire = testarray.indexOf(ScopeData.scope_number);
        if (ScopeData.scope_position_LT !== undefined) {
            existScope[inquire].scope_position_LT.x = ScopeData.scope_position_LT.x
            existScope[inquire].scope_position_LT.y = ScopeData.scope_position_LT.y
            existScope[inquire].scope_position_BR.x = ScopeData.scope_position_BR.x
            existScope[inquire].scope_position_BR.y = ScopeData.scope_position_BR.y
        }
        if (ScopeData.scope_alarm_status !== undefined || ScopeData.scope_threshold !== undefined) {
            existScope[inquire].scope_alarm_status = ScopeData.scope_alarm_status
            existScope[inquire].scope_threshold = ScopeData.scope_threshold
        }
        saveScopeData(existScope)
    } else if (ScopeData.status === "1") {
        var testarray = []
        ScopeData.forEach(function (element) {
            testarray.push(element.scope_number)
        })
        inquire = testarray.indexOf(ScopeData.scope_number);
        ScopeData.splice(inquire, 1)
        console.log(inquire)
        if (inquire !== -1) {
            saveScopeData(existScope)
        }
    }
    res.send({
        success: true,
    })
})
// 刪除"範圍"資料
app.post('/object/deletescope', (req, res) => {
    const username = JSON.parse(req.body)
    //get the existing userdata
    const existUsers = getScopesData()
    //filter the userdata to remove it
    var testarray = []
    existUsers.forEach(function (element) {
        testarray.push(element.name)
    })
    inquire = testarray.indexOf(username.name);
    existUsers.splice(inquire, 1)
    console.log(inquire)
    saveScopeData(existUsers)
    res.send({
        success: true,
        //     msg: 'User removed successfully'
    })
})

// 新增線
app.post('/api/monitor/object/add/line', (req, res) => {
    var status = true;
    const lines = getLinesData()
    console.log(lines)
    var totle = 0
    if (lines.length === 0) {
        totle = 0
    } else if (lines.length >= 6) {
        status = false;
    } else {
        totle = lines.length
    }
    if (status) {
        var linessum = 0
        if (lines.length === 0) {
            linessum = totle + 1
        } else {
            var testarray = []
            lines.forEach(function (element) {
                testarray.push(element.line_number)
            })
            linessum = linessum + 1
            while (testarray.includes(linessum)) {
                linessum = linessum + 1
            }
        }
        var locationX = (20 + linessum * 20) / 640
        var locationY = (80 + linessum * 20) / 480
        var locationX1 = (80 + linessum * 20) / 640
        var locationY1 = (20 + linessum * 20) / 480
        locationX = locationX.toFixed(4)
        locationY = locationY.toFixed(4)
        var newArray = {
            "line_number": linessum,
            "line_temperature_max": 23,
            "line_position_point_A": {
                "x": locationX,
                "y": locationY
            },
            "line_position_point_B": {
                "x": locationX1,
                "y": locationY1
            },
            "line_alarm_status": 0,
            "line_threshold": 20
        }
        lines.push(newArray)
        lines.sort(function (a, b) {
            return a.name - b.name
        })
        saveLineData(lines);
    }
    res.send({
        success: true,
        //     msg: 'User data added successfully'
    })
})
// 編輯"線"資料
app.post('/api/monitor/object/change/line', (req, res) => {
    const LineData = JSON.parse(req.body)
    const existLine = getLinesData()
    if (LineData.status === "0") {
        var testarray = []
        existLine.forEach(function (element) {
            testarray.push(element.line_number)
        })
        inquire = testarray.indexOf(LineData.line_number);
        // if (LineData.select === "pointA") {
        if (LineData.line_position_point_A !== undefined) {
            existLine[inquire].line_position_point_A.x = LineData.line_position_point_A.x
            existLine[inquire].line_position_point_A.y = LineData.line_position_point_A.y
            // } else if (LineData.select === "pointB") {
            existLine[inquire].line_position_point_B.x = LineData.line_position_point_B.x
            existLine[inquire].line_position_point_B.y = LineData.line_position_point_B.y
        }
        if (LineData.line_alarm_status !== undefined || LineData.line_threshold !== undefined) {
            existLine[inquire].line_alarm_status = LineData.line_alarm_status
            existLine[inquire].line_threshold = LineData.line_threshold
        }
        saveLineData(existLine)
    } else if (LineData.status === "1") {
        var testarray = []
        existLine.forEach(function (element) {
            testarray.push(element.line_number)
        })
        inquire = testarray.indexOf(LineData.line_number);
        existLine.splice(inquire, 1)
        console.log(inquire)
        if (inquire !== -1) {
            saveLineData(existLine)
        }
    }
    res.send({
        success: true,
    })
})
// 刪除"線"資料
app.post('/object/deleteline', (req, res) => {
    const username = JSON.parse(req.body)
    //get the existing userdata
    const existUsers = getLinesData()
    //filter the userdata to remove it
    var testarray = []
    existUsers.forEach(function (element) {
        testarray.push(element.name)
    })
    inquire = testarray.indexOf(username.name);
    existUsers.splice(inquire, 1)
    console.log(inquire)
    saveLineData(existUsers)
    res.send({
        success: true,
        //     msg: 'User removed successfully'
    })
})
/* util functions */
// 測試 ------- Thermal_MO test pages
app.get('/api/monitor/test', (req, res) => {
    const UserGetDate = url.parse(req.url, true).query
    // })
    console.log(UserGetDate.date)
    var data = {}
    var today = new Date(UserGetDate.date + ' 00:00:00')
    var date = new Date(today)
    date_s = date.getTime()
    // console.log(time.getFullYear()+'' + time.getMonth() + time.getDate() + "_T" + time.getHours() + time.getMinutes() + time.getSeconds())
    var objects = ['參考點', '點1', '點2', '點3', '點4', '點5', '點6', '線1', '線2', '線3', '線4', '線5', '線6', '矩形1', '矩形2', '矩形3', '矩形4', '矩形5', '矩形6', 'difference01', 'difference02', 'difference03']
    // var objects = ['參考點']
    var rangePointRandom = [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    for (var i = 0; i < 86400; i = i + 10) {
        console.log(i)
        var setTime = date.setTime(date_s + 1000 * i)
        var time = new Date(setTime)
        let year = time.getFullYear();
        let month = ("0" + (time.getMonth() + 1)).slice(-2);
        let date1 = ("0" + time.getDate()).slice(-2);
        let hours = ("0" + time.getHours()).slice(-2);
        let minutes = ("0" + time.getMinutes()).slice(-2);
        let seconds = ("0" + time.getSeconds()).slice(-2);
        var key = year.toString() + month.toString() + date1.toString() + "_T" + hours.toString() + minutes.toString() + seconds.toString()
        var array = {}
        objects.forEach(function (element) {
            if (element === '參考點') {
                Object.assign(array, {
                    [element]: {
                        value: generateRandomInt(20, 23),
                        point: 0
                    }
                })
            } else if (element === 'difference01') {
                Object.assign(array, {
                    [element]: {
                        value: generateRandomInt(30, 60),
                        point: 0
                    }
                })
            } else if (element === 'difference02' || element === 'difference03') {
                Object.assign(array, {
                    [element]: {
                        value: generateRandomInt(15, 20),
                        point: 0
                    }
                })
            } else {
                Object.assign(array, {
                    [element]: {
                        value: generateRandomInt(30, 60),
                        point: rangePointRandom[generateRandomInt(0, rangePointRandom.length)]
                    }
                })
            }

        })
        data[key] = array
    }
    res.send(data)
    xxx++
})

app.get('/api/alarm/list', (req, res) => {
    var params = url.parse(req.url, true).query;
    console.log(params)
    const first = new Date(params.table_timeselectStart + ' 00:00:00').getTime();
    const last = new Date(params.table_timeselectStop + ' 23:59:59').getTime();
    var object = ['spot', 'line', 'scope']
    var arr = []
    for (var i = 0; i < getRandomIntInclusive(0, 50); i++) {
        var start = getRandomIntInclusive(first, last)
        var soc = getRandomIntInclusive(300, 3600)
        var stop = (start + (soc * 1000))
        arr.push({
            table_itemName: object[getRandomIntInclusive(0, 2)] + getRandomIntInclusive(1, 6),
            table_alarm_start: start,
            table_alarm_stop: getDateTimeToConvert(stop),
            table_alarm_threshold: 60,
            table_max: generateRandomInt(65.0, 80.5),
        })
    }
    // console.log(arr)
    arr = objArraySort(arr, 'table_alarm_start')
    arr.forEach((value, index) => {
        var start = getDateTimeToConvert(value.table_alarm_start)
        arr[index].table_alarm_start = start
    })
    res.send(arr)
})
app.get('/api/alarm/txt', (req, res) => {
    var output = []
    var arr = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 3]
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 24; j++) {
            output.push([i, j, arr[getRandomIntInclusive(0, arr.length)]])
        }
    }
    res.send(output)
})
app.get('/api/alarm/test', (req, res) => {
    var output = []

    res.send(output)
})
app.get('/api/alarm/max', (req, res) => {
    var output = null
    var time = []
    var max = {
        spot1: [],
        line1: [],
        scope1: []
    }
    var min = []
    var avg = []
    var date = new Date()
    for (var i = 0; i < getRandomIntInclusive(10, 150); i++) {
        // var dateTime = date.setTime(date.getTime() + (getRandomIntInclusive(10, 3600) * 1000))
        // time
        var dateTime = date.setTime(date.getTime() + 1000)
        var setDate = new Date(dateTime)
        var getDate =
            setDate.getFullYear() +
            "" +
            ("0" + (setDate.getMonth() + 1)).slice(-2) +
            "" +
            ("0" + setDate.getDate()).slice(-2) + "_T" +
            ("0" + setDate.getHours()).slice(-2) + "" +
            ("0" + setDate.getMinutes()).slice(-2) + "" +
            ("0" + setDate.getSeconds()).slice(-2)
        time.push(getDate)
        // max
        max.spot1.push(getRandomIntInclusive(10, 55))
        max.line1.push(getRandomIntInclusive(10, 55))
        max.scope1.push(getRandomIntInclusive(10, 55))
    }
    output = {
        time: time,
        max: max,
        min: min,
        avg: avg
    }
    res.send(output)
})

function objArraySort(objArr, key) {
    let result = objArr.slice(0);
    return result.sort((a, b) => a[key] - b[key]);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getDateTimeToConvert(time) {
    var time = new Date(time)
    var year = time.getFullYear()
    var month = ("0" + (time.getMonth() + 1)).slice(-2)
    var day = ("0" + time.getDate()).slice(-2)
    var hours = ("0" + time.getHours()).slice(-2)
    var minutes = ("0" + time.getMinutes()).slice(-2)
    var seconds = ("0" + time.getSeconds()).slice(-2)
    var days = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    return days
}

function generateRandomInt(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}
// 測試 ------- Thermal_MO test pages (end)

//read the user data from json file
// save spot
const saveSpotData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./object/spot.json', stringifyData)
}
//get the user data from json file
// get spot
const getSpotsData = () => {
    const jsonData = fs.readFileSync('./object/spot.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}

// save scope
const saveScopeData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./object/scope.json', stringifyData)
}
//get the user data from json file
// get spot
const getScopesData = () => {
    const jsonData = fs.readFileSync('./object/scope.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}

// save Line
const saveLineData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./object/line.json', stringifyData)
}
//get the user data from json file
// get Line
const getLinesData = () => {
    const jsonData = fs.readFileSync('./object/line.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}

const gettest = () => {
    const jsonData = fs.readFileSync('./object/test.json')
    // console.log(JSON.parse(jsonData))
    return JSON.parse(jsonData)
}
const json2array = (json) => {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function (key) {
        result.push(json[key]);
    });
    return result;
}

app.listen(8080, function () {
    console.log("API啟動成功");
})

function defaultArray() {
    output = {
        "status": null,
        "uid": null,
        "information": null,
        "fps": null,
        "date": null,
        "recordTime": null,
        "name": null,
        "position": {
            "LT": null,
            "BR": null,
        }
    };
    return output;
}