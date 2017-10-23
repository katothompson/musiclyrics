// Create d3.js scatterplot of top 100 songs, year vs comparative sentiment, with r rel to song rank.
// Click on circle to see what the song is.

var data = billboardData; // data is contained in billboard.js
var scatterPlot = '#scatterPlot'; // the div where the svg will be appended
var slideContainer = '#slideContainer'; // the div where the slider will be appended
var startingRank = 90;
var width = 600;
var height = 500;
var padding = 60;
var circleColor = 'limegreen';
var tooltipBgColor = 'mediumspringgreen'
var fillOpacity = .65;

// create svg element and append to div with id scatterPlot
var svg = d3.select(scatterPlot).append('svg')
      .attr('height', height)
      .attr('width', width)

// create container element and append to svg. This will hold the scatter plot
var container = svg.append('g')

// define domain of the x and y data and range of the pixel scale
var xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year)) // d3.extent returns the min and max values of attribute 
      .range([padding,width-padding]) //pixel space

var yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Sentiment))
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

// define the axis labels using x and y scales
var yAxis = d3.axisLeft(yScale)
.tickSizeInner(0)
.tickPadding(5)

var xAxis = d3.axisBottom(xScale)
.tickSize(0)
.tickPadding(5)
.tickValues(xTickValues)
.tickFormat(formatAxis);

// append g element to svg and draw axis
var drawXAxis = svg.append("g")
      .attr("transform", "translate(0, " + (height - padding) + ")")
      .call(xAxis)
var drawYAxis = svg.append("g")
      .attr("transform", "translate(" + (padding) + ", 0)")
      .call(yAxis)

// append the labels and title
svg.append("text")
      .attr('x', width/2)
      .attr('y', padding/3)
      .style('text-anchor', 'middle')
      .style('font-size', '1.5em')
      .text('Sentiment Analysis of Billboard Top 100')

svg.append("text")
      .attr('x', width/2)
      .attr('y', height - padding/3)
      .style('text-anchor', 'middle')
      .text('Year')

svg.append("text")
      .attr('transform', 'rotate(-90)')
      .attr('x', -height/2)
      .attr('y', padding/3)
      .style('text-anchor', 'middle')
      .text('Sentiment')

// get slideContainer and append label, slider, datalist
var slider = d3.select(slideContainer).append("label")
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
var tickmarks = d3.select("#tickmarks").append("option")
      .attr("value", 1)
      .attr("label", "1")
tickmarks.append("option")
      .attr("value", 10)
tickmarks.append("option")
      .attr("value", 20)
tickmarks.append("option")
      .attr("value", 30)
tickmarks.append("option")
      .attr("value", 40)
tickmarks.append("option")
      .attr("value", 50)
      .attr("label", "50")
tickmarks.append("option")
      .attr("value", 60)
tickmarks.append("option")
      .attr("value", 70)
tickmarks.append("option")
      .attr("value", 80)
tickmarks.append("option")
      .attr("value", 90)
tickmarks.append("option")
      .attr("value", 100)
      .attr("lable", "100")


// update plot on new value from slider
var updatePlot = d3.select('#rankSlider');

updatePlot.on('input', function() {
      // filter the circles and set fill-opacity to .5 if higher rank than slider value, 
      // and set fill-opacity to 0 if lower rank than slider value.
      // for invisible circles, set r to 0 so that they don't block the tooltip of the visible circles.
      container.selectAll('circle')
            .data(data, d => d.rowid).filter(d => Number(d.Rank) > Number(this.value))
            .transition()
            .duration(500)
            .style("fill-opacity", 0)
            .attr('r', 0);
      container.selectAll('circle')
            .data(data, d => d.rowid).filter(d=> Number(d.Rank) <= Number(this.value))
            .attr("r", d => rScale(d.Rank))
            .transition()
            .duration(200)
            .style("fill-opacity", fillOpacity);
})

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

// bind the data with a key, filter by rank, draw circles
function drawcircles(rank) {
      container.selectAll("circle")
      .data(data.filter(d => Number(d.Rank) <= Number(rank)))
      .enter()
      .append("circle")
            .attr("r", d => rScale(d.Rank))
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yScale(d.Sentiment))
            .attr('class', 'circle')
            .style('fill', circleColor)
            .style('fill-opacity', fillOpacity)
            .on("mouseover", function(d) {
                  if(this.style['fill-opacity'] > 0) {
                        div.transition()
                        .duration(600)
                        .style("opacity", .9);
                      div.html(d.Song + "<br/> by " + d.Artist + "<br/> rank: " + d.Rank)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");  
                  }
                  })
                .on("mouseout", function(d) {
                  if(this.style['fill-opacity'] > 0) {
                        div.transition()
                        .duration(600)
                        .style("opacity", 0);
                  }          
                  })
                  
}

drawcircles(90);
      
            


                  


