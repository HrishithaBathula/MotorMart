import React from 'react'
/*
This Description component displays the car's description from carDetail.listingDescription.
🔍 In short:
✅ If the description is available → it shows the text in a styled box.
⏳ If it's not yet loaded → it shows a placeholder shimmer box (animated gray box) to indicate loading.
Perfect for handling async data rendering smoothly.
*/
function Description({carDetail}) {
  return (
   <div>
       {carDetail?.listingDescription?  <div className='p-10 rounded-xl bg-white shadow-md mt-6 border'>
            <h2 className='my-2 font-medium text-2xl'>Description</h2>
            <p>{carDetail?.listingDescription}</p>
        </div>:
        <div className='w-full h-[100px] mt-7 bg-slate-200 animate-pulse rounded-xl'>
        </div>}
    </div>
  )
}

export default Description