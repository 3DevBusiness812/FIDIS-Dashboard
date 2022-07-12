import { useState, useRef } from 'react'
import * as d3 from 'd3'
import { Axis, Orient } from 'd3-axis-for-react'

type Record = {
  date: Date
  value: number
  name: string
}

const LineChart = ({ chartData, startDate, endDate }) => {
  const data = chartData.map((d: any) => {
    return {
      name: d[0],
      date: new Date(d[1]),
      value: d[5],
    }
  }) as Record[]

  const xDomain = d3.extent(data, (d) => d.date) as [Date, Date]
  if (!xDomain[1]) xDomain[1] = new Date()

  const kMax = d3.max(
    d3.group(data, (d) => d.name),
    ([, group]) => {
      const max = d3.max(group, (d) => d.value) as number
      const min = d3.min(group, (d) => d.value) as number
      return max
    }
  ) as number

  const kMin = d3.max(
    d3.group(data, (d) => d.name),
    ([, group]) => {
      const min = d3.min(group, (d) => d.value) as number
      return min
    }
  ) as number

  const [date, setDate] = useState<Date>(xDomain[1])
  const svgRef = useRef<SVGSVGElement | null>(null)

  const series = d3
    .groups(data, (d) => d.name)
    .map(([key, values]) => {
      return {
        key,
        values: values.map(({ date, value }) => ({ date, value })),
      }
    })

  const width = 700
  const height = 250
  const margin = { top: 20, right: 40, bottom: 30, left: 40 }

  const x = d3
    .scaleUtc()
    .domain(xDomain)
    .range([margin.left, width - margin.right])
    .clamp(true)

  const y = d3
    .scaleLog()
    .domain([kMin, kMax] as [number, number])
    .rangeRound([height - margin.bottom, margin.top])

  const z = d3.scaleOrdinal(d3.schemeCategory10).domain(data.map((d) => d.name))

  const parseDate = d3.utcParse('%Y-%m-%d')

  const formatDate = d3.utcFormat('%B, %Y')

  const line = d3
    .line<{date: Date, value: number}>()
    .x((d) => x(d.date))
    .y((d) => y(d.value))

  const bisect = d3.bisector<Record, Date>((d) => d.date).left

  const onMove = (event: any) => {
    setDate(x.invert(d3.pointer(event, svgRef.current)[0]))
    event.preventDefault()
  }

  return (
    <div>
      { xDomain[0] && (
      <svg
        ref={svgRef}
        // onMouseMove={onMove}
        // onTouchMove={onMove}
        style={{
          WebkitTapHighlightColor: 'transparent',
        }}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <g transform={`translate(0,${height - margin.bottom})`}>
          <Axis scale={x} tickSizeOuter={0} orient={Orient.bottom} />
        </g>
        <g transform={`translate(${margin.left},0)`}>
          <Axis
            tickArguments={[null, (x) => +x.toFixed(6)]}
            scale={y}
            orient={Orient.left}
          />
        </g>
        <g>
          <line
            transform={`translate(${x(date) + 0.5}, 0)`}
            y1={height}
            y2="0"
            stroke="black"
          />
        </g>
        {series.map((serie) => {
          const { values } = serie

          return (
            <g key={serie.key}>
              <path
                fill="none"
                stroke={z(serie.key)}
                strokeWidth="1"
                strokeLinejoin="round"
                strokeLinecap="round"
                d={line(serie.values) as string}
              />
            </g>
          )
        })}
      </svg>
      )}
    </div>
  )
}

export default LineChart