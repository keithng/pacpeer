function Summary (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

Summary.prototype = _.extend(Summary.prototype, Base.prototype)
Summary.prototype = _.extend(Summary.prototype, {
  id      : "summary",
  classes : "section text collapse",
//   title   : "Summary",
  apiPath : "/api/summary/"
})

// Draw function
Summary.prototype.draw = function (data) {
  var div = this.$

  // Some summary data has an empty first paragraph
  data.summary = data.summary.replace("<p><span></span></p>", "")
  if (data.url) {
    data.summary += "<a class=wikipedia href=" + data.url + " target=_blank>via Wikipedia</a>"
  }


  // Add text
  var text = $("<div/>", {
    class : "text",
    html  : data.summary
  }).appendTo(div)

  // If text has more than one paragraph, collapse
  if (text.children().length > 1) {
    $("<div/>", {
      class : "expand",
      html  : "More..."
    }).appendTo(div).click(function (e) {
      div.toggleClass("collapse")
      div.find(".expand").html((div.hasClass("collapse")) ? "More..." : "Less...")
    })
  }
}

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(Summary)
