var express = require('express');
var path = require('path');
var logger = require('morgan');

const api = require("./routes/api");

var app = express();

const csp = 
`default-src 'none';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
connect-src 'self';
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
  console.log("ok")
  next()
})

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(api);


module.exports = app;
