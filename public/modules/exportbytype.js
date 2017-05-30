function ExportByType (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

ExportByType.prototype = _.extend(ExportByType.prototype, Base.prototype)
ExportByType.prototype = _.extend(ExportByType.prototype, {
  id      : "exportbytype",
  classes : "section linegraph",
  title   : "Top Export Types",
  apiPath : "/api/exportbytype/"
})

// Draw function
ExportByType.prototype.yAxisLabel = "Millions of USD"
ExportByType.prototype.draw = ExportByType.prototype._lineGraph

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(ExportByType)
