import React from 'react'

export default function LargeCard({data}) {
  const {color,period,sales,icon:Icon}=data;
  return (
    <div className={`rounded-lg text-white shadow-md p-8 flex items-center flex-col gap-2 ${color}`}>
        <Icon/>
        <h4 className='font-bold'>{period}</h4>
        <h2 className='lg:text-2xl text-1xl'>{sales} TND</h2>
    </div>
  )
}
