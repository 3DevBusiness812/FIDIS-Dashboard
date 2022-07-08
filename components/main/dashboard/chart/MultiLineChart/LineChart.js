import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'

const LineChart = ({ chartData, startDate, endDate }) => {

  const svgRef = useRef(null)

  const buildLineChart = (chartData, {
  x = ([x]) => x, // given d in data, returns the (temporal) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  z = () => 1, // given d in data, returns the (categorical) z-value
  margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
} = {}) => {
  
// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the 1st line
var valueline = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.close); });

// define the 2nd line
var valueline2 = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.open); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


// format the data
chartData.forEach(function(d) {
  d.date = parseTime(d.date);
  d.close = +d.close;
  d.open = +d.open;
});

// Scale the range of the data
x.domain(d3.extent(chartData, function(d) { return d.date; }));
y.domain([0, d3.max(chartData, function(d) {
return Math.max(d.close, d.open); })]);

// Add the valueline path.
svg.append("path")
  .data([chartData])
  .attr("class", "line")
  .attr("d", valueline);

// Add the valueline2 path.
svg.append("path")
  .data([chartData])
  .attr("class", "line")
  .style("stroke", "red")
  .attr("d", valueline2);

// Add the X Axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
  .call(d3.axisLeft(y));


  const extent = [[0, 0], [width, height]];
		
  var zoom = d3.zoom()
    .scaleExtent([1, 100])
    .translateExtent(extent)
    .extent(extent)
    .on("zoom", zoomed)
    .on('zoom.end', zoomend);
    svg.call(zoom)

    function zoomed() {
			
			var t = d3.event.transform;
			let xScaleZ = t.rescaleX(xScale);
			
			let hideTicksWithoutLabel = function() {
				d3.selectAll('.xAxis .tick text').each(function(d){
					if(this.innerHTML === '') {
					this.parentNode.style.display = 'none'
					}
				})
			}

			gX.call(
				d3.axisBottom(xScaleZ).tickFormat((d, e, target) => {
						if (d >= 0 && d <= dates.length-1) {
					d = dates[d]
					hours = d.getHours()
					minutes = (d.getMinutes()<10?'0':'') + d.getMinutes() 
					amPM = hours < 13 ? 'am' : 'pm'
					return hours + ':' + minutes + amPM + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
					}
				})
			)

			candles.attr("x", (d, i) => xScaleZ(i) - (xBand.bandwidth()*t.k)/2)
				   .attr("width", xBand.bandwidth()*t.k);
			stems.attr("x1", (d, i) => xScaleZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);
			stems.attr("x2", (d, i) => xScaleZ(i) - xBand.bandwidth()/2 + xBand.bandwidth()*0.5);

			hideTicksWithoutLabel();

			gX.selectAll(".tick text")
			.call(wrap, xBand.bandwidth())

		}

		function zoomend() {
			var t = d3.event.transform;
			let xScaleZ = t.rescaleX(xScale);
			clearTimeout(resizeTimer)
			resizeTimer = setTimeout(function() {

			var xmin = new Date(xDateScale(Math.floor(xScaleZ.domain()[0])))
				xmax = new Date(xDateScale(Math.floor(xScaleZ.domain()[1])))
				filtered = _.filter(prices, d => ((d.Date >= xmin) && (d.Date <= xmax)))
				minP = +d3.min(filtered, d => d.Low)
				maxP = +d3.max(filtered, d => d.High)
				buffer = Math.floor((maxP - minP) * 0.1)

			yScale.domain([minP - buffer, maxP + buffer])
			candles.transition()
				   .duration(800)
				   .attr("y", (d) => yScale(Math.max(d.Open, d.Close)))
				   .attr("height",  d => (d.Open === d.Close) ? 1 : yScale(Math.min(d.Open, d.Close))-yScale(Math.max(d.Open, d.Close)));
				   
			stems.transition().duration(800)
				 .attr("y1", (d) => yScale(d.High))
				 .attr("y2", (d) => yScale(d.Low))
			
			gY.transition().duration(800).call(d3.axisLeft().scale(yScale));

			}, 500)
			
		}  



      return svg.node();
    }

    useEffect(() => {
    if (svgRef.current) {
    svgRef.current.appendChild(buildLineChart(chartData));
  }
}, [])

return (
  <div ref={svgRef}>
  </div>
)
}

export default LineChart
