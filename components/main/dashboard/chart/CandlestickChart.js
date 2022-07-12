import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'


const CandlestickChart = ({ chartData, startDate, endDate }) => {

  const svgRef = useRef(null)

  const buildCandlestickChart = (chartData, {
    date = d => d[1], // given d in data, returns the (temporal) x-value
    open = d => d[2], // given d in data, returns a (quantitative) y-value
    high = d => d[3], // given d in data, returns a (quantitative) y-value
    low = d => d[4], // given d in data, returns a (quantitative) y-value
    close = d => d[5], // given d in data, returns a (quantitative) y-value    
    title = d => d[0], // given d in data, returns the title text
    marginTop = 20, // top margin, in pixels
    marginRight = 40, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 700, // outer width, in pixels
    height = 250, // outer height, in pixels
    xDomain, // array of x-values (defaults to every weekday)
    xRange = [marginLeft, width - marginRight], // [left, right]
    xPadding = 0.2,
    xTicks, // array of x-values to label (defaults to every other Monday)
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xFormat = "%b %-d", // a format specifier for the date on the x-axis
    yFormat = "~f", // a format specifier for the value on the y-axis
    yLabel = "↑ Price ($)", // a label for the y-axis
    stroke = "currentColor", // stroke color for the daily rule
    strokeLinecap = "round", // stroke line cap for the rules
    colors = ["#4daf4a", "#999999", "#e41a1c"] // [up, no change, down]
  } = {}) => {

    // Compute values.
    const X = d3.map(chartData, date);
    const Yo = d3.map(chartData, open);
    const Yc = d3.map(chartData, close);
    const Yh = d3.map(chartData, high);
    const Yl = d3.map(chartData, low);
    const I = d3.range(X.length);


    // Compute default domains and ticks.
    if (xDomain === undefined) xDomain = X; // weekdays(d3.min(X), d3.max(X));
    if (yDomain === undefined) yDomain = [d3.min(Yl), d3.max(Yh)];
    if (xTicks === undefined) xTicks = X.filter(d => d.getUTCDay() === 1) ;// weeks(d3.min(xDomain), d3.max(xDomain), 2);
    
    // Construct scales and axes.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.utcFormat(xFormat)).tickValues(xTicks);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

    // Compute titles.
    if (title === undefined) {
      const formatDate = d3.utcFormat("%B %-d, %Y");
      const formatValue = d3.format(".2f");
      const formatChange = (f => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));
      title = i => `${formatDate(X[i])}
    Open: ${formatValue(Yo[i])}
    Close: ${formatValue(Yc[i])} (${formatChange(Yo[i], Yc[i])})
    Low: ${formatValue(Yl[i])}
    High: ${formatValue(Yh[i])}`;
    } else if (title !== null) {
      const T = d3.map(chartData, title);
      title = i => T[i];
    }
    
    const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(xAxis)
    .call(g => g.select(".domain").remove());

    svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(yAxis)
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
      .attr("stroke-opacity", 0.2)
      .attr("x2", width - marginLeft - marginRight))
    .call(g => g.append("text")
      .attr("x", -marginLeft)
      .attr("y", 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text(yLabel));
      
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

    const g = svg.append("g")
    .attr("stroke", stroke)
    .attr("stroke-linecap", strokeLinecap)
    .selectAll("g")
    .data(I)
    .join("g")
    .attr("transform", i => `translate(${xScale(X[i])},0)`);

    g.append("line")
    .attr("y1", i => yScale(Yl[i]))
    .attr("y2", i => yScale(Yh[i]));

    g.append("line")
    .attr("y1", i => yScale(Yo[i]))
    .attr("y2", i => yScale(Yc[i]))
    .attr("stroke-width", xScale.bandwidth())
    .attr("stroke", i => colors[1 + Math.sign(Yo[i] - Yc[i])]);

    if (title)
      g.append("title").text(title);

      function zoomed({transform}) {
        g.attr("transform", transform);
    }         

    return svg.node();
  }

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.appendChild(buildCandlestickChart(chartData));
    }
  }, [])

  return (
    <div ref={svgRef}>
    </div>
  )
}

export default CandlestickChart

