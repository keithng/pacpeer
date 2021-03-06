function Telecoms (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

Telecoms.prototype = _.extend(Telecoms.prototype, Base.prototype)
Telecoms.prototype = _.extend(Telecoms.prototype, {
  id      : "telecoms",
  classes : "section text collapse",
//   title   : "Telecoms",
  apiPath : "/api/telecoms/"
})

// Draw function
Telecoms.prototype.draw = function (data) {
  var div = this.$

  // Add text
  var text = $("<div/>", {
    class : "text",
    html  : data.summary
  }).appendTo(div)
}

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(Telecoms)
