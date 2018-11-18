var express = require('express');
const http = require('http')
var path = require('path');
var logger = require('morgan');

var app = express();

const csp = 
`default-src 'none';
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
connect-src 'self' 
ws://localhost:${process.env.BUSTIMINGS_PORT || '8081'} 
wss://${process.env.BUSTIMINGS_HOSTNAME} 
http://localhost:${process.env.BUSTIMINGS_PORT || '8081'} 
https://${process.env.BUSTIMINGS_HOSTNAME};
object-src 'none';
img-src 'self' data:;
base-uri 'none';
form-action 'none';
font-src 'self' https://fonts.gstatic.com;
manifest-src 'self';
frame-ancestors 'none';`.split("\n").join("")

app.use((_,res,next)=>{
  res.header("Content-Security-Policy",csp)
  //Stop clickjacking
  //https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet
  res.header("X-Frame-Options","deny")
  //Ask browsers to help detect XSS
  //https://infosec.mozilla.org/guidelines/web_security#x-xss-protection
  res.header("X-XSS-Protection","1; mode=block")
  res.header("X-Content-Type-Options","nosniff")
  res.header("Strict-Transport-Security","max-age=31536000; includeSubDomains")
  res.header("Referrer-Policy","strict-origin")
  res.header("Expect-CT",`max-age=31536000, enforce`)
  res.header(`Feature-policy`,`geolocation 'none'; accelerometer 'none';ambient-light-sensor 'none'; sync-xhr 'none'; autoplay 'none';payment 'none'`)
  res.header("x-powered-by","some software")
  next()
})

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
// app.use(api);

const server = http.createServer(app)
const websocket = require("./websocket")
const io = websocket.createServer(server,app)


module.exports = {
  app,
  server,
  io
};
