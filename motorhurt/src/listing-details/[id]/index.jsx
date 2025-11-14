import Header from '@/components/Header'
import React, { useEffect, useState } from 'react'
import DetailHeader from '../components/DetailHeader'
import { useParams } from 'react-router-dom';
import { db } from './../../../configs';
import { CarImages, CarListing } from './../../../configs/schema';
import { eq } from 'drizzle-orm';
import Service from '@/Shared/Service';
import ImageGallery from '../components/ImageGallery';
import Description from '../components/Description';
import Features from '../components/Features';
import Footer from '@/components/Footer';
import Pricing from '../components/Pricing';
import Specification from '../components/Specification';
import OwnersDetail from '../components/OwnersDetail';
import FinanacialCalculator from '../components/FinanacialCalculator';
import MostSearchedCar from '@/components/MostSearchedCar';

/*
This ListingDetail page displays the detailed view of a single car selected by the user.

🔍 In short, it does:
Grabs the id from the URL using useParams() (e.g., /listing/42)

Fetches that car's full details from the database using Drizzle ORM

Passes the data (carDetail) into various child components:

🔝 DetailHeader: Main car title, make, model

🖼️ ImageGallery: Carousel of car images

📝 Description: Car description

✅ Features: Feature list (e.g., ABS, Airbags)

📊 Pricing: Price breakdown

🔧 Specification: Engine, fuel, etc.

🧍 OwnersDetail: Seller info

🧮 FinancialCalculator: EMI calculation

Also shows MostSearchedCar (cross-promotion) and Footer.

✅ This page acts as the product detail page of your car marketplace.
*/

function ListingDetail() {

    const {id}=useParams();
    const [carDetail,setCarDetail]=useState();

    useEffect(()=>{
        GetCarDetail();
    },[])

    const GetCarDetail=async()=>{
        const result=await db.select().from(CarListing)
        .innerJoin(CarImages,eq(CarListing.id,CarImages.carListingId))
        .where(eq(CarListing.id,id));

        const resp=Service.FormatResult(result);

        setCarDetail(resp[0]);
    }

  return (
    <div>
        <Header/>

        <div className='p-10 md:px-20'>
        {/* Header Detail Component  */}
            <DetailHeader carDetail={carDetail} />
        
        <div className='grid grid-cols-1 md:grid-cols-3 w-full mt-10 gap-5'>
            {/* Left  */}
            <div className='md:col-span-2 '>
                {/* Image Gallery  */}
                    <ImageGallery carDetail={carDetail}/>
                {/* Description  */}
                    <Description carDetail={carDetail}/>
                {/* Features List  */}
                    <Features features={carDetail?.features} />
                 {/* Finanacial Calculator      */}
                 <FinanacialCalculator carDetail={carDetail}/>
                
            </div>
            {/* Right  */}
            <div >
                {/* Pricing  */}
                <Pricing carDetail={carDetail} />
                {/* Car Specification  */}
                <Specification carDetail={carDetail} />
                {/* Owners Details  */}
                <OwnersDetail carDetail={carDetail} />
            </div>
        </div>
        <MostSearchedCar/>
        </div>
        <Footer/>
    </div>
  )
}

export default ListingDetail

/*
⚠️ 1. Why is resp[0] used after formatting the result? What are the assumptions here, and could it be risky?
answer:)Risks:
If id is invalid or doesn't exist in the DB:
resp will be an empty array.
resp[0] will be undefined.
This could cause runtime errors when child components access properties like carDetail.name, etc.
How to fix or improve:
if (!resp.length) {
  // Show "Car not found" message or redirect
  return;
}
setCarDetail(resp[0]);
✅ 1. What is the purpose of storing carDetail in state instead of directly using the fetch result?
Purpose:
Storing carDetail in useState allows React to track and re-render the component when the data is fetched and available.

Why it’s necessary:
React components render before async data is available.

Without useState, you wouldn’t be able to conditionally show UI (e.g., loaders or car info) once data arrives.

It decouples initial state from data-fetching lifecycle(You're separating the rendering logic of your component from the timing of when the data arrives)

Summary:
State provides a way to trigger re-renders when async data is loaded.



📦 What does useState provide here?
answer:)
| Feature                   | Benefit                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| **Tracking changes**      | React re-renders when state updates                                     |
| **Async compatibility**   | Stores data that arrives after initial render                           |
| **Conditional rendering** | Easily show loaders, fallbacks, or content depending on the state value |
| **Isolation**             | Keeps `carDetail` separate from other logic (e.g., UI, DB, layout)      |
🔄 Bonus: What if you didn’t use state?
You’d have to manually force re-renders using hacks like forceUpdate, and still wouldn’t benefit from React’s automatic reconciliation and rendering flow.

11)Synchronous vs Asynchronous Data Loading in React (or in general)
answer:)✅ Synchronous (sync) data loading
Happens immediately, step-by-step.
The program waits for the operation to finish before continuing.
All lines run in order — no delays, no waiting.
⏳ Asynchronous (async) data loading
Happens later (after some delay), like fetching from a database or API.
The program doesn't wait — it continues executing other code while waiting for the async operation to complete.
async function getCar() {
  const result = await fetch("/api/car"); // async: takes time
  const car = await result.json();
  console.log(car);
}
While fetch() is happening, React doesn't block — the rest of the page can load.
When the data arrives, React re-renders with updated content (using useState()).



✅ 1. Why is carDetail passed into multiple components like Pricing, Features, etc.?
Reason:
To break down a large UI into smaller, reusable, manageable components.
Each component (e.g., <Pricing />) can focus on only one piece of data and only one UI responsibility.
Promotes clean separation of concerns.

✅ 2. What issues might arise if carDetail is undefined or partially loaded?
answer:)Possible issues:
Child components may try to access properties on undefined, causing runtime errors like:
If only part of the data is loaded, components might render incomplete or misleading information.
Components might show inconsistent UI (e.g., Pricing shows undefined, but Description shows real text)

✅ 3. Should we wrap all children in one loader check or let each handle null separately?
answwer:)
| Option                                                         | Pros                                                  | Cons                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **Single loader** (e.g., `if (!carDetail) return <Loading />`) | ✅ Centralized control <br> ✅ Cleaner child components | ❌ Entire page is blocked if one part fails or is slow                   |
| **Each handles nulls**                                         | ✅ Parts of UI can show sooner <br> ✅ More resilient   | ❌ Lots of repetitive null checks <br> ❌ Harder to manage UX consistency |

✅ Best Practice: Use a combination:
Wrap main layout or critical components behind a top-level loader.
Let non-critical components (like MostSearchedCar) gracefully handle missing props inside themselves.

✅ 2. If the gallery has many images, how would you optimize loading?
answer:) Strategies:
Lazy loading: Use loading="lazy" in <img /> to load images only when they enter the viewport.
Compression: Use tools like ImageKit, WebP format, or CDN-backed optimization.
Thumbnail-first: Load low-res preview and swap with high-res (e.g., blurred placeholders).
✅ Improves performance, TTI (time to interactive), and user experience, especially on mobile networks.

✅ 3. Should MostSearchedCar be memoized or its logic isolated?
Yes — and here’s why:
If reused across pages (e.g., homepage and listing detail), fetching logic might run redundantly.
React.memo or custom hooks (usePopularCars) can help:
const carList = usePopularCars(); // internally handles fetch + cache

✅ Benefits:
Avoids double fetching.
Keeps UI components lean.
Easier testing and error handling.

📊 Data Structure & Backend Considerations
✅ 4. What happens if a car has multiple images (CarImages)?
With .innerJoin(CarListing, CarImages):
You get N rows per car, where N = number of images.
✅ Each row contains full CarListing + one image (flattened result).
⚠️ Problem:
Duplicates of CarListing data.
Must group or transform in frontend (e.g., aggregate into an array of images).
🧠 Your Service.FormatResult likely does this transformation.

✅ 5. If features are stored as a comma-separated string or JSON array, how to display?
Comma-separated string:
const features = car.features?.split(',');
// ['Sunroof', 'ABS', 'Bluetooth']
JSON array string (e.g., '["Sunroof", "ABS"]'):
const features = JSON.parse(car.features);
// ['Sunroof', 'ABS']
Display in JSX:
<ul>
  {features.map((feat, i) => <li key={i}>{feat}</li>)}
</ul>
✅ Ensure safety: add null checks + try-catch around JSON.parse.

✅ 3. Would you SSR this page for SEO? What parts would benefit?
Yes — especially if:
The page is public (e.g., no auth required).
Cars are indexed by Google (you want /listing/:id to rank).
SSR Benefits:
Pre-rendered HTML = Better SEO and first paint.
Can render <title>, <meta>, and even JSON-LD structured data (for car schema).
📌 Use libraries like react-helmet or next/head to inject meta info dynamically.
 
✅ 1. When should you use code-splitting or lazy loading for subcomponents?
Code-splitting or React.lazy should be used when:
The component is large (e.g., ImageGallery, FinanacialCalculator).
It’s not immediately visible above the fold (e.g., MostSearchedCar, Footer).
You want to improve initial page load time.
Benefits:
Faster first paint.
Reduces JS bundle size.
Scales well with growing feature set.

Code-splitting in React means breaking your code into smaller chunks, so only the necessary parts are loaded when needed — instead of loading everything upfront.
🧠 Why it's useful:
If your component (like ListingDetail) imports many heavy subcomponents (e.g., ImageGallery, FinancialCalculator), loading them all at once can slow down the initial page load.
Code-splitting solves this by loading these parts only when needed.
Instead of:
import ImageGallery from '../components/ImageGallery';
You can lazy load it like this:
import React, { lazy, Suspense } from 'react';
const ImageGallery = lazy(() => import('../components/ImageGallery'));
Then wrap its usage in <Suspense>:
<Suspense fallback={<div>Loading gallery...</div>}>
  <ImageGallery carDetail={carDetail} />
</Suspense>
🚀 Benefits:
Faster initial load.
Better performance on slower devices or networks.
Scales well as the app grows.


*/