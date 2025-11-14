import Service from '@/Shared/Service';
import { db } from './../../configs';
import { CarImages, CarListing } from './../../configs/schema';
import { and ,eq,or,lte} from 'drizzle-orm';
//import { lte } from "drizzle-orm";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '@/components/Header';
import Search from '@/components/Search';
import CarItem from '@/components/CarItem';


//import { and, eq } from "drizzle-orm";
//SearchByOptions is a React component that dynamically fetches and displays a list of cars based on URL query parameters (cars, make, price) — typically used for search results.
/*🧩 Core Functionality:
1. Query Parameters Handling:
Uses useSearchParams() from React Router DOM.
Extracts:
cars → mapped to car condition (e.g., "used", "new")
make → car manufacturer (e.g., "Toyota")
price → (currently unused in the query)

2. Fetching Data from Database:
On component mount (useEffect([])), it calls GetCarList().
Fetches data using drizzle-orm from:
CarListing table (car details)
Joined with CarImages (for car image)
Filters applied conditionally based on query parameters (only if they exist).

3.Formatting Data
Uses a custom utility Service.FormatResult(result) to format the database output (likely flattens or extracts necessary fields).

4. Rendering UI
Displays:
A header (<Header />)
A search bar component (<Search />)
A grid of car items using <CarItem /> if data exists
A loading skeleton (pulse animation) if data is still loading or empty
*/
function SearchByOptions() {
    //query parameters are ectracted here using usesearchprams hook
    const [searchParam]=useSearchParams();
    const [carList,setCarList]=useState([]);
   // const condition=searchParam.get('cars');//"used"
    const rawCondition = searchParam.get('cars');
    const condition = rawCondition && rawCondition !== "undefined" ? rawCondition : undefined;
   // const make=searchParam.get('make');//"toyota"
   const rawMake = searchParam.get('make');
   const make = rawMake && rawMake !== "undefined" ? rawMake : undefined;
    //const price=searchParam.get('price');
    const rawPrice = searchParam.get('price');
const price = rawPrice && rawPrice !== "undefined" ? rawPrice : undefined;
    console.log("condition:", condition);
    console.log("make:", make);
    console.log("make:", price);
   /* const [resetParams, setresetParams] = useSearchParams();
       const resetFilters = () => {
        setresetParams({}); // clears all query parameters
     }; */

    
   /* useEffect(()=>{
        GetCarList();
    },[]) 
    */
   useEffect(() => {
    GetCarList();
}, [searchParam]);

    

    const GetCarList=async()=>{
        //using parameters values, from database data is retireved., price was not used here.
      // this is originial
     /*  const result=await db.select().from(CarListing)
        .innerJoin(CarImages,eq(CarListing.id,CarImages.carListingId))
        .where(condition!=undefined&&eq(CarListing.condition,condition))
        .where(make!=undefined&&eq(CarListing.make,make)) */
     
        
    //one more thing use leftjoin instead of inner join to show cars details even though images not present
// changed version here
    const filters = [];
    if (condition){filters.push(eq(CarListing.condition, condition));
  console.log("car condition satisfied",filters);
    }
    if (make){filters.push(eq(CarListing.make, make));
  console.log(" car make satisfied",filters);
    }
  /*  if (price) {
    filters.push(lte(CarListing.price, Number(price)));
  } */
 if (!isNaN(Number(price))) {
  filters.push(lte(CarListing.sellingPrice, Number(price)));
}
 console.log("filters:", filters);

   /*let query = db.select().from(CarListing)
      .innerJoin(CarImages, eq(CarListing.id, CarImages.carListingId)); */
let query = db.select().from(CarListing)
  .leftJoin(CarImages, eq(CarListing.id, CarImages.carListingId)); 

     // {filters.length === 0 && <p>Showing all available cars</p>}
    if (filters.length === 1 ) {
       query = query.where(or(...filters));
    }
    else if(filters.length > 0){
        query = query.where(and(...filters));
    }
    const result = await query;
console.log("Raw DB result:", result);
 /*   Advantages:
Skips undefined filters (avoids errors)
All conditions are applied (not overwritten)
Scales to more filters like price, model, etc
    */
        const resp=Service.FormatResult(result);
      console.log("Formatted result:", resp);
        setCarList(resp);
    }


  return (
    <div>
        <Header/>

        <div className='p-16 bg-black flex justify-center'>
            <Search/>
        </div>
        <div className='p-10 md:px-20'>
            <h2 className='font-bold text-4xl '>Search Result</h2>

            {/* List of CarList  */}
        {/*  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7'>
                {carList?.length>0? carList.map((item,index)=>(
                    <div key={index}>
                        <CarItem car={item} />
                    </div>
                )):
                [1,2,3,4,5,6].map((item,index)=>(
                    <div className='h-[320px] rounded-xl bg-slate-200 animate-pulse'>
                   </div>
                ))}   
            </div> */}
            {/* List of CarList  */}
<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7'>
  {carList?.length > 0 ? (
    carList.map((item, index) => (
      <div key={item.id || index}>
        <CarItem car={item} />
      </div>
    ))
  ) : (
    <>
      {/* No Results Message */}
      <div className="col-span-full text-center text-gray-500 py-10">
      </div>

      {/* Placeholder loading blocks (optional) */}
      {[...Array(6)].map((_, index) => (
        <div key={index} className='h-[320px] rounded-xl bg-slate-200 animate-pulse'></div>
      ))}
    </>
  )}
</div>

{/*
 ✅ Added carList.length === 0 condition 
 {carList.length === 0 && (
     <div className="text-center text-gray-500 py-10">
         <p>No cars found matching your criteria.</p>
         <button onClick={resetFilters} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Reset Filters</button>
     </div>
 )}
*/}
        </div>
    </div>
  )
}

export default SearchByOptions


/*
1. What does useSearchParams() do in React Router DOM?
ans:) It allows you to read and manipulate query parameters from the URL in a React component.
2.what is useParams() ?
ans:) react js useParams Hook helps to access the parameters of the current route to manage the dynamic routes in the url.
3.)what is nested routing?
4.) How does it compare with useParams()?
| Feature    | `useParams()`                       | `useSearchParams()`                |
| ---------- | ----------------------------------- | ---------------------------------- |
| Works with | **Path parameters**                 | **Query string parameters**        |
| URL format | `/search/:make`                     | `/search?make=Toyota&cars=used`    |
| Use case   | Dynamic routes                      | Filters, pagination, sorting, etc. |
| Returns    | Plain object (`{ make: "Toyota" }`) | URLSearchParams object             |
5.) When would you prefer one over the other?
ans)| Hook                | When to Use                                                                                                                     | Example                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `useSearchParams()` | When you want to update **page content without changing the route path** — useful for filters, sorting, or optional parameters. | `/search?make=Toyota&cars=used`               |
| `useParams()`       | When the value is **part of the URL structure** and defines a unique page.                                                      | `/car-details/:id` (e.g., `/car-details/123`) |

📝 Example Use Case:
On a search results page with many filters, you'd use useSearchParams() to allow users to update filters via the URL without navigating to a different page.
On a car detail page, you'd use useParams() because each :id maps to a different car's dedicated page.

6)How would the UI change if condition or make is missing from the URL?
If a parameter is missing:
searchParam.get(...) returns null
The corresponding filter condition will be skipped (due to condition !== undefined &&)
🧠 Implication:
It might fetch broader results (e.g., all makes if make is missing)
If both are missing, the user might see all available cars
👉 To handle this better:
Show a fallback message like:"No filters applied. Showing all available listings."
Optionally disable the query if required filters are missing by usinfg conditional checks.

7)Why .where(condition !== undefined && eq(...)) is problematic in PostgreSQL (and generally):
answer:)In Drizzle ORM (or any SQL builder), passing false or undefined to .where() may lead to:
invalid SQL generation
or no filter at all (and unexpected query behavior)
or the ORM throwing an error

import { and } from "drizzle-orm";

const filters = [];

if (condition) filters.push(eq(CarListing.condition, condition));
if (make) filters.push(eq(CarListing.make, make));

let query = db.select().from(CarListing)
  .innerJoin(CarImages, eq(CarListing.id, CarImages.carListingId));

if (filters.length > 0) {
  query = query.where(and(...filters));
}
This is more scalable for when you want to add more filters later (e.g., model, price, year).

8)3. How to dynamically construct filters for more params (color, model, year)?
answer:) Use dynamic query building by checking if each filter is present:
if (color) query = query.where(eq(CarListing.color, color));
if (model) query = query.where(eq(CarListing.model, model));
if (year) query = query.where(eq(CarListing.year, year));
Alternatively, use an array to build conditions and pass them as a .and(...) clause.
A dynamic query means you're constructing SQL conditions based on data available during execution, rather than hardcoding the logic upfront.(like color:blur,year:2022 etc..)

9.)Should you still chain multiple .where() calls?
ans:)query.where(A).where(B); // Only B is applied.
query.where(and(A, B, C)); // Combine all collect conditions and pass them together.
query.where(or(A, B, C)); 

10).Difference between .innerJoin and .leftJoin

11.)6. Why might .innerJoin() be risky here?
If a car has no image in CarImages, an innerJoin will exclude it from results.
Safer alternative:
Use .leftJoin to include all cars, even if the image is missing.

11) add the pagination and sorting and rangefilters to this component.
ans:)1. Pagination
Helps show a few cars at a time (e.g., 10 per page).

const page = parseInt(searchParam.get('page')) || 1;
const limit = 10;
const offset = (page - 1) * limit;

query = query.limit(limit).offset(offset);
✅ 2. Sorting
Let users sort by price, year, or createdAt, etc.

const sortBy = searchParam.get('sortBy'); // e.g., 'price', 'year'
const sortOrder = searchParam.get('order') || 'desc'; // 'asc' or 'desc'

if (sortBy && CarListing[sortBy]) {
  const sortColumn = CarListing[sortBy];
  query = query.orderBy(sortOrder === 'asc' ? sortColumn : desc(sortColumn));
}
✅ Only apply .orderBy() if sortBy is valid

✅ 3. Range Filters (e.g., min-max price)
const minPrice = parseInt(searchParam.get('minPrice'));
const maxPrice = parseInt(searchParam.get('maxPrice'));

if (!isNaN(minPrice)) filters.push(gte(CarListing.price, minPrice));
if (!isNaN(maxPrice)) filters.push(lte(CarListing.price, maxPrice));

ask chatgpt for full code , based on this it will give.

6)⚛️ 1. Why are placeholder divs with animate-pulse shown instead of a spinner/message?
Answer:

animate-pulse skeletons simulate the structure of the actual content (i.e., car cards) before real data loads.

Instead of showing a loading spinner (which provides no context), skeleton loaders make the user feel like content is “about to appear.”

✅ Pros:

Better perceived performance.

Keeps layout stable — avoids "jumps" when data loads.

Familiar UX pattern (used in Facebook, LinkedIn, etc.).

❌ Cons:

Harder to implement for dynamic layouts.

Not useful if data is slow or fails to load — can mislead users.

10) 3. Why is key={index} used in .map()? What are the risks?
Answer:

key helps React track which items change during updates, for efficient re-rendering.

Using index works only when the list never changes order or size.

❌ Risks of using index as key:

If list items are added/removed/reordered, it can cause:

Incorrect component re-use

Broken animations

Unexpected bugs in forms (like wrong input states)

✅ Better:
Use a unique identifier like car.id:
carList.map(car => <CarItem key={car.id} car={car} />)


13)1️⃣ Is it a good idea to call the database directly from the component?
❌ Not ideal. Calling the DB from the frontend tightly couples the UI and DB logic. This has major drawbacks:

No abstraction layer

Harder to maintain and test

Security risk (exposing DB queries in frontend)

Difficult to reuse logic across pages

✅ Better architecture:
Use an API layer (e.g., /api/search route):

Component fetches from the API

API handles DB access and formatting

Improves separation of concerns

ts
Copy
Edit
// Frontend
fetch(`/api/search?make=Toyota&condition=used`);

// Backend API route (e.g., Next.js /api/search.js or Express handler)
const result = await db.select()...


14)How would you add pagination to the result set?

15)💥 Error Handling & Resilience
4️⃣ What happens if the DB query fails or is slow?
If unhandled:

UI will be blank or stuck

Console may log error, but user sees nothing

✅ Graceful handling:

ts
Copy
Edit
try {
  const result = await fetchCars();
  setCarList(result);
} catch (e) {
  console.error(e);
  setError(true);
}
5️⃣ Where would you show the error?
Inside JSX:

jsx
Copy
Edit
{error && (
  <div className="text-red-500 text-center mt-5">
    Something went wrong. Please try again later.
  </div>
)}
Optional:

Fallback images

Retry buttons

Offline indicators

6️⃣ How would you retry?
✅ Manual:

jsx
Copy
Edit
<button onClick={GetCarList}>Retry</button>
✅ Auto retry (basic):

ts
Copy
Edit
let attempts = 0;
const GetCarList = async () => {
  while (attempts < 3) {
    try {
      const result = await fetchCars();
      setCarList(result);
      return;
    } catch (e) {
      attempts++;
      if (attempts === 3) setError(true);
    }
  }
};
✅ Advanced: Use libraries like React Query or SWR, which have built-in retry, caching, error boundaries.
*/

