function Template (parent, a3) {
  this._init(parent) // Creates container element on page
  this.loadData(a3)  // Loads data then runs draw(data)
}

// Extend from Base object
Template.prototype = _.extend(Template.prototype, Base.prototype)

Template.prototype = _.extend(Template.prototype, {
  id      : "template",      // ID is used by style.less/style.css to apply module-specific styles
  classes : "section text",  // All modules should have .section style applied, additional styles of .text or .linegraph
  title   : "Template",      // Title for this block - title will not be created if this is null
  apiPath : "/api/template/" // API path for this module
})

// Draw function
Template.prototype.draw = function (data) {
  var div = this.$
  console.log("---- Creating template ----")
  console.log("Data from API:", data)
  console.log("Container element:", div[0])
  // Add text
  var text = $("<div/>", {
    class : "text",
    html  : data.test
  }).appendTo(div)

  console.log("Text element:", text[0])
}

// App automatically loads every module in MODULES...
// BUT REMEMBER: You'll need to load this file (template.js) in index.ejs
MODULES.push(Template)

