var _            = require('underscore')
var express      = require('express')
var path         = require('path')
var favicon      = require('serve-favicon')
var logger       = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser   = require('body-parser')

// HTTPS stuff
var fs           = require('fs')
var https        = require('https')

var Country      = require('./routes/utils/countries')

// Start
console.log("Starting app.")
var app = express()

// EJS view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('less-middleware')(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))


/////////////////
//  Listeners  //
/////////////////
// Set up HTTPS listener
var server = https.createServer({
  key  : fs.readFileSync("/etc/letsencrypt/live/dev.pacpeer.org/privkey.pem"),
  cert : fs.readFileSync("/etc/letsencrypt/live/dev.pacpeer.org/fullchain.pem"),
  ca   : fs.readFileSync("/etc/letsencrypt/live/dev.pacpeer.org/chain.pem")
}, app)
server.listen(3443, function () {
  console.log("HTTPS listener ready.")
})

// Set up a secondary server to redirect HTTP to HTTPS
var http = express()
http.use('*', function (req, res) {
  res.redirect("https://dev.pacpeer.org" + req.originalUrl)
})
http.listen(8080, function () {
  console.log("HTTP listener ready.")
})


//////////////
//  Routes  //
//////////////
// API for app data
app.use('/api/', require('./routes/api'))

// Actual app page
app.use('/app/:a3', function (req, res, next) {
  var a3   = req.params.a3,
      name = Country.getName(a3)
  if (name == "Unknown") res.redirect("/error") // Die if an invalid country is entered
  else res.render('index', {
    activeCountries : Country.getActive(),
    countryCode     : a3,
    countryName     : name
  })
})

// Catch blank calls to app path
app.use('/app/', function (req, res, next) {
  res.redirect("/app/nzl") // Default to NZL
})

// Catch all other paths
app.use('*', function (req, res) {
  res.status(404).render("404", {
    activeCountries : Country.getActive()
  })
})

module.exports = app
