import React, { useState, useEffect } from 'react'
import moment from 'moment'
import ChartCustomization from './ChartCustomization'
import LineChart from './MultiLineChart/LineChart'
import CandlestickChart from './CandlestickChart'
import OhlcChart from './OhlcChart'

const ChartsWrapper = ({ chartData }) => {
  const [chartInterval, setChartInterval] = useState(1)
  // state for showing current type of charts
  const [currentChart, setCurrentChart] = useState('line_chart')
  // state for start & end chart date values
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [selectedItems, setSelectedItems] = React.useState(['FI25'])

  const onChangeSelection = (name) => {
    const newSelectedItems = selectedItems.includes(name)
      ? selectedItems.filter((item) => item !== name)
      : [...selectedItems, name]
    setSelectedItems(newSelectedItems)
  }

  useEffect(() => {
    chartData.length == 0
      ? ''
      : setStartDate(
          moment(
            chartData[chartData.length - 1].date.getTime() -
              24 * 60 * 60 * 1000 * 365
          ).format('YYYY-MM-DDThh:mm')
        )
    chartData.length == 0
      ? ''
      : setEndDate(
          moment(chartData[chartData.length - 1].date).format(
            'YYYY-MM-DDThh:mm'
          )
        )
  }, [chartData])

  //give data an ohlc structure
  const filteredData = chartData.filter(
    (d) => selectedItems.includes(d.name) || selectedItems.includes('FI25')
  )
  const ohlcData = filteredData.map((data) => {
    const newDataObject = [
      data.name || 'FI25',
      data.date,
      data.open,
      data.high,
      data.low,
      data.close,
      data.percentChange,
    ]
    return newDataObject
  })

  let minValue, maxValue
  let finalData = []
  while (ohlcData.length > 0) {
    const intervalArray = ohlcData.splice(0, chartInterval)
    minValue = intervalArray[0][4]
    maxValue = intervalArray[0][3]
    for (let x = 1; x < intervalArray.length; x++) {
      if (intervalArray[x][1] < minValue) minValue = intervalArray[x][4]
      if (intervalArray[x][4] > maxValue) maxValue = intervalArray[x][3]
    }

    const newArr = [
      intervalArray[0][0],
      intervalArray[0][1],
      intervalArray[0][2],
      maxValue,
      minValue,
      intervalArray[intervalArray.length - 1][3],
    ]

    finalData.push(newArr)
  }

  return (
    <div className="relative col-span-9 flex h-full w-full flex-col bg-black/30">
      <ChartCustomization
        currentChart={currentChart}
        setCurrentChart={setCurrentChart}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        chartInterval={chartInterval}
        setChartInterval={setChartInterval}
        selectedItems={selectedItems}
        setSelectedItems={onChangeSelection}
      />

      {/* charts */}
      <div className="h-full w-full">
        {currentChart == 'line_chart' ? (
          <LineChart
            chartData={finalData.splice(-50)}
            startDate={startDate}
            endDate={endDate}
          />
        ) :
        currentChart == 'candlestick' ? (          
          <CandlestickChart
          chartData={finalData.splice(-30)}
          startDate={startDate}
         endDate={endDate}
          />
        ) : 
        currentChart == 'ohlc' ? (
          <OhlcChart
           chartData={finalData.splice(-30)}
            startDate={startDate}
          endDate={endDate}
           />
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default ChartsWrapper
