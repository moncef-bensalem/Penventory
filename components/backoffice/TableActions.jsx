import React from 'react'
import { Download, Search, Trash2,} from 'lucide-react'

export default function TableActions() {
  return (
    <div className="flex justify-between py-6 px-12 bg-slate-50 shadow-lg dark:bg-slate-700 rounded-lg items-center gap-8">
          {/*Export*/}
        <button className='flex text-orange-500 hover:text-white border border-orange-500 hover:bg-orange-500 focus:ring-4 focus:outline-none focus:ring-orange-500 font-medium rounded-lg text-sm px-6 mt-3 py-3 space-x-3 text-center me-2 mb-2 dark:border-orange-500 dark:text-orange-500 dark:hover:text-white dark:hover:bg-orange-500 dark:focus:ring-orange-900'><span>Export</span> <Download className='mt-0.5 h-4 w-4'/></button>
          {/*Search*/}
          <div className="flex-grow">
              <label htmlFor="table-search" className="sr-only">Search</label>
              <div className="relative">
                  <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                      <Search className='w-4 h-4 text-gray-500 dark:text-gray-400'/>
                  </div>
                  <input type="text" id="table-search" className="block py-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500 w-full" placeholder="Search for categories"/>
              </div>
          </div>
          {/*Bulk Delete*/}
          <button className='flex items-center space-x-2 bg-red-600 text-white rounded-lg px-6 py-3'>
            <Trash2/>
            <span>Delete Selected</span>
          </button>
    </div>
  )
}
