var height = 400;
var width = 600;
var padding = 70;
var startingRank = 50;
var circleColor = 'limegreen';
var fillOpacity = 0.4;
var tooltipBgColor = 'mediumspringgreen';
var lineColor = "indianred";
var weightedlineColor = "gold";
var svg = d3.select("#scatterPlot").append('svg')
      .attr('height', height)
      .attr('width', width)
var plot = svg.append("g");
var baseurl = './';

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

// append the labels, title, and key
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

var key = svg.append('g')
      .attr('transform', 'translate(' + (width - padding) + ', ' + padding + ')')
key.append('text')
      .attr('y', 15) 
      .attr('x', 5)          
      .style('text-anchor', 'end')
      .style('font-size', '0.6rem')
      .text('___average sentiment score')
      .style('fill', lineColor)
key.append('text')
      .attr('y', 30)
      .attr('x', 5)
      .style('text-anchor', 'end')
      .style('font-size', '0.6rem')
      .text('___weighted average sentiment score')
      .style('fill', weightedlineColor)

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
            tickmarks.append("option")
                  .attr("value", j)
      }

// get data async

d3.json(baseurl + "billboardtop100.json", function(err, rows) {
      if(err) {
            console.log('error getting data', err);
      } else {
            var data = rows;
            var meanData = createMeanData(data);
            var meanweightedData = createMeanWeightedData(data);

            // draw the scatter plot
            drawPlot(data, 50, meanData, meanweightedData);

            // todo onclick show lyrics
      }
})
// line data
var createMeanData = function(data) {
      var minYear = d3.min(data, d => d.Year)
      var maxYear = d3. max(data, d => d.Year)
      var meanSentimentArray = [];
      for (var i = minYear; i <= maxYear; i++) {
            var dataFiltered = data.filter(d => +d.Year === +i)
            var avg = d3.mean(dataFiltered, d => d.sentiment);
            meanSentimentArray.push({ "year":+i, "meansentiment":+avg})
      }
      return meanSentimentArray;
}

var createMeanWeightedData = function(data) {
      var minYear = d3.min(data, d => d.Year)
      var maxYear = d3. max(data, d => d.Year)
      var meanWeightedSentimentArray = [];
      for (var i = minYear; i <= maxYear; i++) {
            var dataFiltered = data.filter(d => +d.Year === +i)
            var avg = d3.mean(dataFiltered, d => (d.sentiment * 100) / d.Rank);
            meanWeightedSentimentArray.push({ "year":+i, "meansentiment":+avg})
      }
      return meanWeightedSentimentArray;
}
      
// draw the plot
var drawPlot = function(data, rank, meanData, meanweightedData) {

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
      .range([4, 1.5])

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
                        div.transition()
                              .duration(600)
                              .style('opacity', .9);
                        div.html(d.Song + "<br/> by " + d.Artist + "<br/> rank: " + d.Rank)
                              .style("left", (d3.event.pageX) + "px")
                              .style("top", (d3.event.pageY - 28) + "px");
                  })
                  .on('mouseout', function(d) {
                        div.transition()
                              .duration(400)
                              .style("opacity", 0)
                  })
                  .transition()
                  .duration(400)
                  .style('fill-opacity', fillOpacity)

      // draw line
      // Define the line
      var meanline = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.meansentiment));  

      var meanweightedline = d3.line()
                  .x(d => xScale(d.year))
                  .y(d => yScale(d.sentiment));

      svg.append("path")
            .attr("class", "line")
            .attr("d", meanline(meanData))
            .style('stroke', lineColor) 
            .style('stroke-width', '2')
            .style('fill', 'none');
      svg.append("path")
            .attr("class", "line")
            .attr("d", meanline(meanweightedData))
            .style('stroke', weightedlineColor) 
            .style('stroke-width', '2')
            .style('fill', 'none');
              
      // update plot on new value from slider
      var slider = d3.select('#rankSlider');
      slider.on('input', function() {
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
                        .on('mouseover', function(d) {
                              div.transition()
                                    .duration(400)
                                    .style('opacity', .9);
                              div.html(d.Song + "<br/> by " + d.Artist + "<br/> rank: " + d.Rank)
                                    .style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                        })
                        .on('mouseout', function(d) {
                              div.transition()
                                    .duration(600)
                                    .style("opacity", 0);
                        })
                        .transition()
                        .duration(400)
                        .style('fill-opacity', fillOpacity)
                  
            // remove old circles
            update.exit()
                        .transition()
                        .duration(400)
                        .style('fill-opacity', 0)
                        .attr('r', d => 0)
                  .remove();
      }

}