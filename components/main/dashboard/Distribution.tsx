import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react'
import * as d3 from 'd3'
import { useIndexPrices, useBalances } from '../../../state/application/hooks'
import { getBalanceNumber } from '../../../utils/balance'
import { DefaultIndexDecimals } from '../../../config/types'

interface PieData {
  name: string
  value: number
}

const initialPieChartData = {
  labels: ['FI25', 'GoldFI', 'MetaFI', 'NFTFI', 'GameFI', 'DeFiFI'],
  datasets: [
    {
      label: 'FIDIS Index Pie Chart',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        'rgb(56 189 248)',
        'rgb(250 204 21)',
        'rgb(74 222 128)',
        'rgb(45 212 191)',
        'rgb(251 146 60)',
        'rgb(192 132 252)',
      ],
      borderColor: [
        'rgb(56 189 248)',
        'rgb(250 204 21)',
        'rgb(74 222 128)',
        'rgb(45 212 191)',
        'rgb(251 146 60)',
        'rgb(192 132 252)',
      ],
      borderWidth: 1,
    },
  ],
}

const chartWidth = 180,
  chartHeight = 180

const Distribution = () => {
  const [pieDataType, setPieDataType] = useState<string>('Balance')
  const svgRef = useRef<SVGSVGElement | null>(null)

  const indexBalances = useBalances()
  const indexPrices = useIndexPrices()

  let pieChartData = useMemo(() => {
    let pieData = initialPieChartData
    initialPieChartData.labels.map((key, index) => {
      const balance = indexBalances[key] // wei
      const ethBal = getBalanceNumber(balance, DefaultIndexDecimals[key])
      if (pieDataType === 'Balance') {
        pieData.datasets[0].data[index] = ethBal /* Number(ethBal.toFixed(3))*/
      } else {
        pieData.datasets[0].data[index] =
          ethBal * Number(indexPrices[key].price) /* Number((
          ethBal * Number(indexPrices[key].price)
        ).toFixed(1))*/
      }
    })

    return pieData
  }, [indexBalances, indexPrices, pieDataType])

  if (!pieChartData) pieChartData = initialPieChartData

  const pData = pieChartData.labels.map((key, index) => ({
    name: key,
    value: pieChartData.datasets[0].data[index]
  }))

  // Compute values.
  const N = d3.map(pData, (x) => x.name)
  const V = d3.map(pData, (x) => x.value)
  const I = d3.range(N.length).filter((i) => !isNaN(V[i]))

  // Unique the names.
  const names = new d3.InternSet(N)

  // Chose a default color scheme based on cardinality.
  let colors = d3.schemeSpectral[names.size]
  if (colors === undefined)
    colors = d3.quantize(
      (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
      names.size
    )

  // Construct scales.
  const color = d3
    .scaleOrdinal(names, colors)
    .range(initialPieChartData.datasets[0].backgroundColor)

  // Compute titles.
  const formatValue = d3.format(',')
  const title = (i) => `${N[i]}\n${formatValue(V[i])}`

  const pie = d3.pie<PieData>().value((d) => d.value)
  const arc = d3
    .arc<d3.PieArcDatum<PieData>>()
    .innerRadius(0)
    .outerRadius(Math.min(chartWidth / 2, chartHeight / 2))
  const arcs = pie(pData)

  // const padAngle = 1
  // const arcs = d3
  //   .pie<number>()
  //   .padAngle(padAngle)
  //   .sort(null)
  //   .value((i: any) => V[i])(I)
  // const arc = d3
  //   .arc<d3.PieArcDatum<number>>()
  //   .innerRadius(0)
  //   .outerRadius(Math.min(chartWidth / 2, chartHeight / 2))

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg
      .append('g')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`)
      .selectAll('path')
      .data(arcs)
      .join('path')
      .style('fill', (d, i) => color(N[i]))
      .attr('d', arc)
      .append('title')
      .text((d, i) => title(i))
  }, [pData])

  const handleBalanceToggle = () => {
    setPieDataType((p) => (p === 'Balance' ? 'Value' : 'Balance'))
  }

  return (
    <div className="col-span-4 w-full rounded bg-black/30 py-2 px-3">
      <nav className="flex items-center justify-between border-b border-gray-300/30 py-2">
        <h1 className="text-xl font-medium">Distribution</h1>
      </nav>
      {/* <h2 className="py-3 text-sm">FI25 Crypto Index Token</h2> */}
      <div className="flow-root pt-8">
        <div className="float-left">
          <svg ref={svgRef} width={chartWidth} height={chartHeight} />
        </div>
        <div className="float-right">
          <p className="bg-sky-400 p-0.5 text-sm text-center">FI25</p>
          <p className="bg-yellow-400 p-0.5 text-sm text-center">GoldFI</p>
          <p className="bg-green-400 p-0.5 text-sm text-center">MetaFI</p>
          <p className="bg-teal-400 p-0.5 text-sm text-center">NFTFI</p>
          <p className="bg-orange-400 p-0.5 text-sm text-center">GameFI</p>
          <p className="bg-purple-400 p-0.5 text-sm text-center">DeFIFI</p>
        </div>
      </div>
      <div className="flex justify-end">
        <label
          htmlFor="value_balance"
          className="relative mt-2 flex cursor-pointer items-center hover:scale-105"
        >
          <span className="mr-1.5 cursor-pointer text-sm font-medium">
            Balance
          </span>
          <div className="relative">
            <input
              onClick={handleBalanceToggle}
              type="checkbox"
              id="value_balance"
              className="sr-only cursor-pointer"
            />
            <div className="toggle_bg h-5 w-8 cursor-pointer rounded-full border-2 border-gray-200 bg-transparent"></div>
          </div>

          <span className="ml-1.5 cursor-pointer text-sm font-medium">
            Value
          </span>
        </label>
      </div>
    </div>
  )
}

export default Distribution
