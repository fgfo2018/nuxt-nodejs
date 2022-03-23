var express = require('express');
var app = express();
var router = express.Router();
var fs = require("fs");
var http = require('http');
var url = require('url');
var util = require('util');

router.route('/test').get(function (req, res, next) {
   // fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
   // res.end(data);
   // });
   // let test = [];
   // test['uid'] = req.query.uid;
   // test['passwd'] = req.query.uid;
   test = {
      uid: req.query.uid,
      passwd: req.query.passwd
   };
   test = JSON.stringify(test);
   console.log(test);
   res.end(test);
   // res.setHeader("Access-Control-Allow-Origin", "*"); //跨CORS來源解除限制，請在正式上線移除，或是更改設定值
});
// var log = 0;

router.route('/camera').get(function (req, res, next) {
   output = defaultArray();
   res.setHeader('Content-Type', 'text/html; charset=utf8');
   res.setHeader("Access-Control-Allow-Origin", "*"); //跨CORS來源解除限制，請在正式上線移除，或是更改
   // fs.readFile(__dirname + "/" + "camera.json", 'utf8', function (err, data) {
   // res.end(data);
   // console.log("呼叫成功" + log);
   // log = log + 1;
   // });
   var params = url.parse(req.url, true).query;
   if (params.name !== undefined) {
      output["status"] = 200
      output['uid'] = "FLIR29245"
      output['fps'] = 12
      output['name'] = params.name
   } else {
      output.status = 400
   }
   res.write(JSON.stringify(output))
   res.end();
});

app.use(router);

var server = app.listen(8080, function () {

   var host = server.address().address
   var port = server.address().port
   console.log("API啟動成功:http://%s:%s", host, port);

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