import React from 'react'
import { FaCheck } from "react-icons/fa6";

/*
🔍 In Short:
It receives a features prop (likely a JSON object or parsed data).
If features exists:
It maps over the entries of the object using Object.entries().
Displays each feature name (the key) in a styled box with a ✅ check icon.

*/

function Features({features}) {
  return (
    <div className='p-10 border shadow-md rounded-xl my-7'>
        <h2 className='font-medium text-2xl'>Features</h2>

        <div className='grid grid-cols-1 md:grid-cols-3 mt-5 lg:grid-cols-4 gap-7'>
          { /* {features&&Object.entries(features).map(([features,value])=>(
                <div className='flex gap-2 items-center'>
                    <FaCheck className='text-lg p-1 rounded-full bg-blue-100 text-primary' />
                   <h2>{features}</h2> 
                </div>
            ))}
                */}
             {features&&Object.entries(features).map(([featureName, value]) => (
              <div className='flex gap-2 items-center' key={featureName}>
                 <FaCheck className='text-lg p-1 rounded-full bg-blue-100 text-primary' />
                 <h2>{featureName}</h2>
              </div>
             ))}
        </div>
    </div>
  )
}

export default Features