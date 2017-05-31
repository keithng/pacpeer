var _         = require('underscore')
var router    = require('express').Router()
var query     = require("pg-query")

var Country   = require('./utils/countries')
var stackData = require('./utils/tradedata').stack
// var dataCube  = require('./utils/tradedata').cube

query.connectionParameters = "postgres://app:wildostrichrunningtowardsglasscastle@localhost:5432/pacpeer"
var INIT_YEAR = 2009


// Check country code is valid
router.get('/:mode/:a3', function (req, res, next) {
  var a3   = req.params.a3,
      name = Country.getName(a3)
  if (name == "Unknown") res.redirect('/error') // Die if an invalid country is entered
  else next()
})


// Wikipedia summary
router.get('/summary/:a3', function (req, res, next) {
  query(
    "SELECT * FROM summaries " +
    "WHERE a3=UPPER($1)",
    [req.params.a3],
    function (err, rows) {
      if (err) console.error(err)
      var result = rows[0] || {},
          name   = Country.getName(req.params.a3),
          title  = /&titles\=(.*)/.exec(result.url)
      var data   = {
        name    : name,
        url     : (title) ? "https://en.wikipedia.org/wiki/" + title[1] : null,
        summary : result.text || ""
      }
      res.send(data)
    }
  )
})


// Telecoms summary
router.get('/telecoms/:a3', function (req, res, next) {
  query(
    "SELECT * FROM telecoms_text " +
    "WHERE a3=UPPER($1)",
    [req.params.a3],
    function (err, rows) {
      if (err) console.error(err)
      var summary = (rows[0]) ? rows[0].summaries : null
      var data    = {
        name    : Country.getName(req.params.a3),
        summary : summary || ""
      }
      res.send(data)
    }
  )
})


// Map zoomboxes for individual country
router.get('/map/:a3', function (req, res, next) {
  query(
    "SELECT * FROM zoomboxes " +
    "WHERE a2=LOWER($1)",
    [Country.getA2(req.params.a3)],
    function (err, rows) {
      res.send(rows[0])
    }
  )
})


// Exports by destination countries
router.get('/exportbydest/:a3', function (req, res, next) {
  query(
    "SELECT dest,year,val " +
    "FROM trade_countries " +
    "WHERE orig=LOWER($1) AND year>$2",
    [req.params.a3, INIT_YEAR],
    function (err, rows) {
      var data = stackData(rows, "dest", "year", "val")
      res.send(data)
    }
  )
})


// Imports by countries of origin
router.get('/importbyorig/:a3', function (req, res, next) {
  query(
    "SELECT orig,year,val " +
    "FROM trade_countries " +
    "WHERE dest=LOWER($1) AND year>$2",
    [req.params.a3, INIT_YEAR],
    function (err, rows) {
      var data = stackData(rows, "orig", "year", "val")
      res.send(data)
    }
  )
})


// Exports by commodities
router.get('/exportbytype/:a3', function (req, res, next) {
  query(
    "SELECT hs07_id,year,export_val " +
    "FROM trade_commodities " +
    "WHERE orig=LOWER($1) AND year>$2",
    [req.params.a3, INIT_YEAR],
    function (err, rows) {
      var data = stackData(rows, "hs07_id", "year", "export_val")
      res.send(data)
    }
  )
})


// Imports by commodities
router.get('/importbytype/:a3', function (req, res, next) {
  query(
    "SELECT hs07_id,year,import_val " +
    "FROM trade_commodities " +
    "WHERE orig=LOWER($1) AND year>$2",
    [req.params.a3, INIT_YEAR],
    function (err, rows) {
      var data = stackData(rows, "hs07_id", "year", "import_val")
      res.send(data)
    }
  )
})


// Market share
router.get('/marketshare/:a3', function (req, res, next) {
  query(
    "SELECT p.id,p.provider_name,p.provider_url,p.provider_description,p.incumbent," +
    "parent.provider_name AS parent_name,parent.provider_url AS parent_url," +
    "ms.country_code,ms.share,ms.last_updated " +
    "FROM market_share AS ms " +
    "JOIN providers AS p ON ms.provider_id=p.id " +
    "LEFT OUTER JOIN providers AS parent ON p.subsidiary_id=parent.id " +
    "WHERE ms.country_code=$1",
    [Country.getA2(req.params.a3)],
    function (err, rows) {
      var data = {}
      _.each(rows, function (d) {
        // Add up share if this provider already exists
        if (data[d.id]) {
          data[d.id].share += d.share
        }
        // Otherwise create new provider
        else {
          data[d.id] = {
            // Provider data
            name          : d.provider_name,
            url           : d.provider_url,
            description   : d.provider_description,
            incumbent     : d.incumbent,
            parentName    : d.parent_name,
            parentUrl     : d.parent_url,
            // Market share data
            a2            : d.country_code,
            country       : Country.getName(d.country_code),
            share         : d.share,
            updated       : d.last_updated
          }
        }
      })

      // Extract and sort
      data = _.values(data)
      data = _.sortBy(data, "share").reverse()

      res.send(data)
    }
  )
})


// Send all unrouted paths forward (to the 404 page)
router.use("*", function (req, res, next) {
  next()
})


module.exports = router
