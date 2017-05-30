function Base (parent, a3) {}

Base.prototype.id      = null // ID of the section
Base.prototype.classes = null // Class of the section
Base.prototype.title   = null // Text of title (optional - no title div will be created if left empty)
Base.prototype.apiPath = null // Resource path as defined in api.js

// Every module runs this first to set up the DOM elements
Base.prototype._init = function (parent) {
  // Get element if it exist or create a new one
  var div = $("#" + this.id)
  if (!div.length) {
    div = $("<div/>", {
      id : this.id
    }).appendTo(parent)
  }
  div.attr("class", this.classes)

  // Add title
  div.find(".title").remove()
  if (this.title) $("<div/>", {
    class : "title",
    html  : this.title
  }).appendTo(div)

  // Handles for manipulating this element
  this.el = div[0]            // Raw DOM element
  this.$  = div               // jQuery object
  this.d3 = d3.select(div[0]) // d3 object
}

// Get data from the API then draw
Base.prototype.loadData = function (a3) {
  var M = this
  $.ajax({
    type    : "GET",
    url     : M.apiPath + a3,
    success : function (series, status, response) {
      M.draw(series)
    },
    error   : function (res, status) {
      console.error(res.responseJSON)
    }
  })
}

// Line graph
Base.prototype.yAxisLabel = ""
Base.prototype._lineGraph = function (series) {
  var top    = 20,
      right  = 100,
      bottom = 50,
      left   = 80,

      svg    = this.d3.append("svg").attr("class", "graph"),
      width  = svg.style("width").replace("px", "") - left - right,
      height = svg.style("height").replace("px", "") - top - bottom,
      inner  = svg.append("g")
                  .attr("class", "inner")
                  .attr("transform", "translate(" + left + "," + top + ")")

  // Prepare data for display
  var parseTime = d3.timeParse("%Y"),
      colours   = d3.schemeCategory10.slice(),
      vals      = [], // Collect values to calculate domain extent
      dates     = []  // Collect dates to calculate domain extent
  _.each(series, function (c) {
    c.colour = colours.shift() // Preset colour for each country
    _.each(c.data, function (d) {
      d.date = parseTime(d.year) // Parse time
      d.val /= 1000000           // Convert to $M values
      dates.push(d.date)
      vals.push(d.val)
    })
  })

/*   // Set legend
  var legend = $("<div/>", { class : "legend" }).appendTo(this.$)
  _.each(series, function (d) {
    var row = $("<div/>", { class : "row" }).appendTo(legend)
    $("<span/>").appendTo(row)
                .css("background-color", d.colour)
    row.append(d.name)
  })
 */
  // Prepare axes
  var xScale = d3.scaleTime(),
      yScale = d3.scaleLinear()
  xScale.rangeRound([0, width])
        .domain(d3.extent(dates))
  yScale.rangeRound([height, 0])
        .domain(d3.extent(vals))

  var xAxis = d3.axisBottom(xScale),
      yAxis = d3.axisLeft(yScale)
  xAxis.ticks(5)
  yAxis.ticks(5).tickFormat(d3.format("$"))


  // Draw axes
  inner.append("g")
       .attr("class", "axis axis-x")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
  inner.append("g")
       .attr("class", "axis axis-y")
       .call(yAxis)
       .append("text")
         .attr("class", "label")
//          .attr("transform", "rotate(-90)")
         .attr("x", left)
//          .attr("y", "-1em")
         .text(this.yAxisLabel)

  // Line constructor
  var line = d3.line()
  line.x(function (d) { return xScale(d.date) })
      .y(function (d) { return yScale(d.val) })

  // Add lines
  _.each(series, function (d) {
    // Container
    var g = inner.append("g")
    g.attr("class", "line")
     .datum(d.data)

    // Line
    g.append("path")
     .attr("d", line)
     .style("stroke", d.colour)

    g.append("text")
     .attr("class", "seriesLabel")
     .attr("x", xScale(_.last(d.data).date) + 10)
     .attr("y", yScale(_.last(d.data).val) + 6)
     .text(d.name)
       .style("fill", d.colour)
       .call(trimText)

    // Dot
    g.selectAll("dot")
     .data(d.data)
     .enter()
       .append("g")
         .attr("class", "dot")
         .append("circle")
           .attr("cx", function(d) { return xScale(d.date) })
           .attr("cy", function(d) { return yScale(d.val) })
           .style("stroke", d.colour)
         .append("text")
           .attr("x", function(d) { return xScale(d.date) })
           .attr("y", function(d) { return yScale(d.val) })
           .text(function (d) { return d.val })
  })
  uncollideLabels(this.$.find(".seriesLabel"))
}

// Collision detection for labels
var uncollideLabels = function (labels) {
  var collision, next,
      threshold = 20, // Labels are considered colliding if they're < this close to each other
      step      = 2,  // Move labels by this much each pass
      labels    = _.map(labels, function (el) {
                    return {
                      el : el,                 // DOM element
                      y  : $(el).attr("y") * 1 // y position of DOM element
                    }
                  })
  labels = _.sortBy(labels, "y")
  do {
    collision = false
    _.each(labels, function (curr, i) {
      next = labels[i + 1]
      if (!next) return
      if (next.y - curr.y < threshold) { // Check if labels collide
        collision = true                 // Raise collision flag
        curr.y -= step                   // Move current label up
        next.y += step                   // Move next label down
      }
    })
  } while (collision)

  // Enact changes
  _.each(labels, function (l) {
    $(l.el).attr("y", l.y)
  })
}

// Trim long label and put full text into mouseover
var trimText = function (textEl) {
  var maxLength = 24,
      orig  = textEl.html(),
      words = orig.split(" "),
      line  = ""

  _.find(words, function (w) {
    // New line
    if (!line) line = w
    // Can fit word into line
    else if ((line + " " + w).length < maxLength) {
      line += " " + w
    }
    // Line full
    else {
      line += "..."
      return true
    }
  })

  textEl.text(line)      // Use trimmed text
        .append("title") // Add tooltip to text
        .html(orig)      // Use original (full) text as tooltip
}
