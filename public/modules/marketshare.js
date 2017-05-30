function MarketShare (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

MarketShare.prototype = _.extend(MarketShare.prototype, Base.prototype)
MarketShare.prototype = _.extend(MarketShare.prototype, {
  id      : "marketshare",
  classes : "section table",
  title   : "ISP Market Share",
  apiPath : "/api/marketshare/"
})

// Draw function
MarketShare.prototype.draw = function (series) {
  var table = $("<table/>", {
    class : "text"
  }).appendTo(this.el)

  // Headers
  var tr = $("<tr/>").appendTo(table)
  _.each([
    "",
    "Share",
    "Incumbent",
    "Subsidiary of"
  ], function (html) {
    $("<th/>", { html : html }).appendTo(tr)
  })

  // Add rows
  _.each(series, function (d) {
    var tr = $("<tr/>").appendTo(table)
    _.each([
      "<a href='" + d.url + "' target=_blank>" + d.name + "</a>",
      (Math.round(d.share) || "<1") + "%",
      d.incumbent,
      d.subsidiary_of
    ], function (html) {
      $("<td/>", { html : html }).appendTo(tr)
    })
  })
}

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(MarketShare)