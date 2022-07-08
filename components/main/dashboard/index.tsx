import React, { useState, useEffect } from 'react'
import MarketCap from './MarketCap'
import Distribution from './Distribution'
import Ad1 from './Ad1'
import Ad2 from './Ad2'
import ChartsWrapper from './chart/ChartsWrapper'

import { getData } from './../../../utils/chartData'

const Index = () => {
  // state for charts data
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    getData().then((data) => {
      setChartData(data)
    })
  }, [])

  return (
    <div className="scrolltype grid h-full grid-rows-2 overflow-hidden pr-2">
      <div className="grid grid-cols-12 gap-4">
        <MarketCap />
        <Distribution />
        <Ad1 />
      </div>
      <div className="chart-wrapper grid grid-cols-12 gap-4 pt-6">
        <ChartsWrapper chartData={chartData} />
        <Ad2 />
      </div>
    </div>
  )
}

export default Index
