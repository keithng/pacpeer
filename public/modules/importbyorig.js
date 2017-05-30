function ImportByOrig (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

ImportByOrig.prototype = _.extend(ImportByOrig.prototype, Base.prototype)
ImportByOrig.prototype = _.extend(ImportByOrig.prototype, {
  id      : "importbyorig",
  classes : "section linegraph",
  title   : "Top Import Countries",
  apiPath : "/api/importbyorig/"
})

// Draw function
ImportByOrig.prototype.yAxisLabel = "Millions of USD"
ImportByOrig.prototype.draw = ImportByOrig.prototype._lineGraph

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(ImportByOrig)
