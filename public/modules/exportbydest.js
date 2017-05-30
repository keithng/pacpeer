function ExportByDest (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

ExportByDest.prototype = _.extend(ExportByDest.prototype, Base.prototype)
ExportByDest.prototype = _.extend(ExportByDest.prototype, {
  id      : "exportbydest",
  classes : "section linegraph",
  title   : "Top Export Destinations",
  apiPath : "/api/exportbydest/"
})

// Draw function
ExportByDest.prototype.yAxisLabel = "Millions of USD"
ExportByDest.prototype.draw = ExportByDest.prototype._lineGraph

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(ExportByDest)
