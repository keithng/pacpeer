function Map (parent, a3) {
  this._init(parent)
  this.loadData(a3)
}

Map.prototype = _.extend(Map.prototype, Base.prototype)
Map.prototype = _.extend(Map.prototype, {
  id      : "map",
  classes : "section map",
//   title   : "Map",
  apiPath : "/api/map/"
})

// Draw function
Map.prototype.draw = function (zoombox) {
  var id  = "map",
      url = 'https://kiwibrew.carto.com/api/v2/viz/19ece3ca-7d86-11e6-ab30-0ee66e2c9693/viz.json'
  cartodb.createVis(id, url, zoombox)
}

// App automatically loads every module in MODULES, you just need to load this js file in index.ejs
MODULES.push(Map)
