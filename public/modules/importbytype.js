function ImportByType (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

ImportByType.prototype = _.extend(ImportByType.prototype, Base.prototype)
ImportByType.prototype = _.extend(ImportByType.prototype, {
  id      : "importbytype",
  classes : "section linegraph",
  title   : "Top Import Types",
  apiPath : "/api/importbytype/"
})

// Draw function
ImportByType.prototype.yAxisLabel = "Millions of USD"
ImportByType.prototype.draw = ImportByType.prototype._lineGraph

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(ImportByType)
