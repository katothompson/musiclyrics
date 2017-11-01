var height = 400;
var width = 500;
var padding = 70;
var startingRank = 50;
var circleColor = 'limegreen';
var fillOpacity = 0.4;
var tooltipBgColor = 'mediumspringgreen';
var svg = d3.select("#scatterPlot").append('svg')
      .attr('height', height)
      .attr('width', width)
var plot = svg.append("g");

// create tooltip
var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("text-align", "center")
      .style("width", "120px")
      .style("padding", "2px")
      .style("font-size", "12px")
      .style("background", tooltipBgColor)
      .style("border", "0px")
      .style("border-radius", "8px")
      .style("pointer-events", "none");

// append the labels and title
var title = svg.append("text")
      .attr('x', width/2)
      .attr('y', padding/3)
      .style('text-anchor', 'middle')
      .style('font-size', '1.5em')
      .text('Sentiment Analysis of Billboard Top 100')

var xLabel = svg.append("text")
      .attr('x', width/2)
      .attr('y', height - padding/3)
      .style('text-anchor', 'middle')
      .text('Year')

var yLabel = svg.append("text")
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', padding/3)
      .style('text-anchor', 'middle')
      .text('Sentiment')
// get slideContainer and append label, slider, datalist
var slider = d3.select(slideContainer)
      slider.append("label")
            .attr("for", "rankSlider")
            .text("Filter by Rank: ")
      slider.append("input")
            .attr("type", "range")
            .attr("min", 1)
            .attr("max", 100)
            .attr("value", startingRank)
            .attr("class", "slider")
            .attr("id", "rankSlider")
            .style("width", "300px")
            .attr("list", "tickmarks")
      slider.append("datalist")
            .attr("id", "tickmarks")
      slider.style("padding-left", padding + "px")
// define the values for the tickmarks on the slider
var tickmarks = d3.select("#tickmarks")
      for (var i = 0; i <= 100; i += 10) {

            var j = i == 0 ? 1:i;
            console.log(j)
            
            tickmarks.append("option")
                  .attr("value", j)
      }

// get data async

d3.json("http://localhost:8080/billboardtop100.json", function(err, rows) {
      if(err) {
            console.log('error getting data', err);
      } else {
            console.log('data loaded ', rows[0])
            var data = rows;
            drawPlot(data, 50);
      }
})

// draw the plot
var drawPlot = function(data, rank) {

      // define domain of the x and y data and range of the pixel scale
      var xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year)) // d3.extent returns the min and max values of attribute 
      .range([padding,width-padding]) //pixel space

      var yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.sentiment))
      .range([height-padding, padding])

      // define the domain of the r data, and the pixel scale
      var rScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Rank))
      .range([4, .8])

      // x tick values
      var formatAxis = d3.format('.0f');
      var xTickValues = createXTickValues();

      function createXTickValues () {
      let values = [];
      let xTickMax = d3.max(data, d => d.Year);
      let xTickMin = Number(d3.min(data, d => d.Year)) ;
      for (let i = xTickMin; i<= xTickMax; i++) { 
            if (i%5 == 0)
            values.push(i);
      }
      return values;
      }

      // define the axis using x and y scales
      var yAxis = d3.axisLeft(yScale)
            .tickSizeInner(0)
            .tickPadding(5)

      var xAxis = d3.axisBottom(xScale)
            .tickSize(0)
            .tickPadding(5)
            .tickValues(xTickValues)
            .tickFormat(formatAxis);

      // append g element to svg and draw axis
      var xAxisGroup = svg.append("g")
            .attr("transform", "translate(0, " + (height - padding) + ")")
            .call(xAxis)
      var yAxisGroup = svg.append("g")
            .attr("transform", "translate(" + (padding) + ", 0)")
            .call(yAxis)

      // filter data by rank
      var dataFiltered = data.filter(d => +d.Rank <= startingRank)
      console.log('filtered data length', data.length)
      // draw plot
      plot.selectAll('circle')
                  .data(dataFiltered)
      .enter()
            .append('circle')
                  .attr("r", d => rScale(d.Rank))
                  .attr("cx", d => xScale(d.Year))
                  .attr("cy", d => yScale(d.sentiment))
                  .attr('class', 'circle')
                  .style('fill', circleColor)
                  .style('fill-opacity',0)
                  .on('mouseover', function(d) {
                        //console.log('mouseover')
                        div.transition()
                              .duration(600)
                              .style('opacity', .9);
                        div.html(d.Song + "<br/> by " + d.Artist + "<br/> rank: " + d.Rank)
                              .style("left", (d3.event.pageX) + "px")
                              .style("top", (d3.event.pageY - 28) + "px");
                  })
                  .on('mouseout', function(d) {
                        //console.log('mouseout')
                        div.transition()
                              .duration(400)
                              .style("opacity", 0)
                  })
                  .transition()
                  .duration(400)
                  .style('fill-opacity', fillOpacity)

      // update plot on new value from slider
      var slider = d3.select('#rankSlider');
      slider.on('input', function() {
            console.log(this.value);
            updatePlot(data, this.value);
      })

      // update the plot
      var updatePlot = function(data, rank) {
            // filter data by rank
            var dataFiltered = data.filter(d => +d.Rank <= rank)

            // draw plot
            var update = plot.selectAll('circle')
                  .data(dataFiltered, d => d.rowid)
                  
            // add new circles
            update.enter()
                  .append('circle')
                        .attr("r", d => rScale(d.Rank))
                        .attr("cx", d => xScale(d.Year))
                        .attr("cy", d => yScale(d.sentiment))
                        .attr('class', 'circle')
                        .style('fill', circleColor)
                        .style('fill-opacity',0)
                        .transition()
                        .duration(400)
                        .style('fill-opacity', fillOpacity)
            // add mouseover for tooltip
             update.merge(update)
                  .on('mouseover', function(d) {
                        //console.log('mouseover')
                        div.transition()
                              .duration(400)
                              .style('opacity', .9);
                        div.html(d.Song + "<br/> by " + d.Artist + "<br/> rank: " + d.Rank)
                              .style("left", (d3.event.pageX) + "px")
                              .style("top", (d3.event.pageY - 28) + "px");
                  })
                  .on('mouseout', function(d) {
                        //console.log('mouseout')
                        div.transition()
                              .duration(600)
                              .style("opacity", 0);
                  })
            // remove old circles
            update.exit()
                        .transition()
                        .duration(300)
                        .style('fill-opacity', 0)
                        .attr('r', d => 3*rScale(d.Rank))
                  .remove();
      }

}