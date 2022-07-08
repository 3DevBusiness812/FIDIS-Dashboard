import React from 'react'
import Image from 'next/image'
import ad from './../../../assets/images/ads/fidis_ad2.jpeg'
const Ad2 = () => {
  return (
    <div className="col-span-3 flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black/20 shadow-sm">
      <Image
        className="object-cover object-right"
        src={ad}
        height={550}
        width={400}
      />
    </div>
  )
}

export default Ad2
