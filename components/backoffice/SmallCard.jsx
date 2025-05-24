import React from 'react'

export default function SmallCard({data}) {
  const {title,number,iconBg,icon:Icon} = data;
  return (
    <div className='rounded-lg shadow-lg bg-slate-50 dark:bg-slate-700 p-4'>
    <div className="flex space-x-4 text-slate-800 dark:text-slate-50 ">
            <div className={`w-12 h-12 ${iconBg} rounded-full items-center flex justify-center`}>
                <Icon className='text-slate-50 dark:text-slate-50'/>
            </div>
            <div className="">
                <p>{title}</p>
                <h3 className='text-2xl font-bold'>{number}</h3>
            </div>
        
    </div>
    </div>
  )
}
