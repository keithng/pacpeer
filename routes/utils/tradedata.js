var _       = require("underscore")
var Country = require('./countries')
var HS07    = require('./hs07')

// Turn result rows into data objects
var stackData = function (input, key1, key2, key3) {
  /*  rows = [
        { "dest" : "aus", "year" : "2013", "val" : 100 },
        { "dest" : "aus", "year" : "2014", "val" : 200 },
        { "dest" : "usa", "year" : "2013", "val" : 300 },
        { "dest" : "usa", "year" : "2014", "val" : 400 }
      ]
      stackData(rows, "dest", "year", "val")

      Would return:
      {
        "aus": { <- Export destination country ("dest")
          "data" : [
            {
              "year" : "2013",
              "val"  : 100
            },{
              "year" : "2014",
              "val"  : 200
            }
          }
        },
        "usa": {
          "data" : [
            {
              "year" : "2013",
              "val"  : 300
            },{
              "year" : "2014",
              "val"  : 400
            }
          }
        }
      }
  */
  var output = {}

  // HS07
  if (key1 == "hs07_id") {
    _.each(input, function (d) {
      var k = d[key1],
          v = d[key3]
      if (v) {
        output[k] = output[k] || {
          hs07 : k,
          name : HS07.getName(k),
          data : []
        }
        var out = {}
        out[key2] = d[key2]
        out.val   = v
        output[k].data.push(out)
      }
    })
  }
  // Country
  else {
    _.each(input, function (d) {
      var k = d[key1],
          v = d[key3]
      if (v) {
        output[k] = output[k] || {
          a3   : k,
          name : Country.getName(k),
          data : []
        }
        var out = {}
        out[key2] = d[key2]
        out.val   = v
        output[k].data.push(out)
      }
    })
  }

  // Calculate 5 year averages
  _.each(output, function (d) {
    var sum = 0, count = 0
    d.data = _.sortBy(d.data, "year")
    _.each(d.data, function (e) {
      count++
      sum += e.val
    })
    d.avg5y = (count) ? sum / count : null
  })

  // Sort and return top 5
  return _.sortBy(output, "avg5y").reverse().slice(0, 5)
}


/* var asDataCube = function (rows, key1, key2, key3) {
  var meta = [
    { title : key1 },
    { title : key2 }
  ]
  // Find unique keys
  meta[0].name = _.chain(rows).pluck(key1).unique().sort().value()
  meta[1].name = _.chain(rows).pluck(key2).unique().sort().value()

  // Create data cube
  var data = []
  _.each(rows, function (r) {
    var d = [
      meta[0].name.indexOf(r[key1]),
      meta[1].name.indexOf(r[key2])
    ]
    data[d[0]] = data[d[0]] || []
    data[d[0]][d[1]] = r[key3]
  })

  // Calculate 5 year averages
  meta[0].avg5y = _.map(data, function (row) {
    var sum = 0, count = 0
    _.each(row, function (d) {
      if (d != null) {
        count++
        sum += d
      }
    })
    return (count) ? sum / count : null
  })

  // Return top 5 (remove all others)
  var threshold = _.sortBy(meta[0].avg5y).reverse()[4]
  for (var i = meta[0].name.length - 1; i >= 0; i--) {
    if (meta[0].avg5y[i] < threshold) {
      meta[0].name.splice(i, 1)
      meta[0].avg5y.splice(i, 1)
      data.splice(i, 1)
    }
  }

  return {
    meta : meta,
    data : data
  }
}
 */


module.exports = {
  stack : stackData,
//   cube  : asDataCube
}
