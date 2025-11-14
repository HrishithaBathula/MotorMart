import FakeData from '@/Shared/FakeData'
import React, { useEffect, useState } from 'react'
import CarItem from './CarItem';
import { inArray } from 'drizzle-orm';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { db } from './../../configs';
import { CarImages, CarListing } from './../../configs/schema';
import { desc, eq } from 'drizzle-orm';
import Service from '@/Shared/Service';
//  this function take top 10 cars from the database(joins the carimages and carlisting) and store it int carlist and then format the data through service.formatresult() and then store the state via usestate.
// and then the carlist state is mapped into car item, where each rendered with car data. 
/*service.formatresult-> takes input as carlist (which is of this format {
  carLisiting: { id: 101, make: "BMW", ... },
  carImages: "url-to-image"
}
) There may be multiple entries for the same car listing, each with a different carImages.so it groups them by carlisting.id and final return a array of cars with iamges bundled*/ 
/* input: of service.format()
  [
  { carLisiting: { id: 1, make: "Honda" }, carImages: "a.jpg" },
  { carLisiting: { id: 1, make: "Honda" }, carImages: "b.jpg" },
  { carLisiting: { id: 2, make: "Toyota" }, carImages: "c.jpg" }
]
 output: 
[
  { id: 1, make: "Honda", images: ["a.jpg", "b.jpg"] },
  { id: 2, make: "Toyota", images: ["c.jpg"] }
]
*/
function MostSearchedCar() {
  
  console.log(FakeData.carList);
   
  const [carList,setCarList]=useState([]);
  useEffect(()=>{
    GetPopularCarList();
  },[])

    const GetPopularCarList=async()=>{
     /* const result=await db.select().from(CarListing)
        .leftJoin(CarImages,eq(CarListing.id,CarImages.carListingId))
        .orderBy(desc(CarListing.id))
        .limit(10)
       
        const resp=Service.FormatResult(result);
        console.log(resp);
        setCarList(resp); */
        // Step 1: Get 10 most recent car listings
const topCars = await db
  .select()
  .from(CarListing)
  .orderBy(desc(CarListing.id))
  .limit(10);

// Step 2: Get all images where carListingId is in those top 10
   const topCarIds = topCars.map(car => car.id);
   const fullData = await db
  .select()
  .from(CarListing)
  .leftJoin(CarImages, eq(CarListing.id, CarImages.carListingId))
  .where(inArray(CarListing.id, topCarIds));
   const formatted = Service.FormatResult(fullData);
   console.log("top 10 cars",formatted);
     setCarList(formatted);
    }
  return (
    <div className='mx-24 hidden md:block'>
        <h2 className='font-bold text-3xl text-center mt-16 mb-7'>Most Searched Cars</h2>
    {/*array.map((element, index) => { ... }) */}
        <Carousel>
        <CarouselContent>
            {carList.map((car,index)=>(
                  <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <CarItem car={car} />
                  </CarouselItem>  
        ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        </Carousel>
       
    </div>
  )
}

export default MostSearchedCar;
/*
1.What are the pros and cons of calling the database directly in the component vs 
fetching from an API route?

2.If the database fetch fails, how would you handle it gracefully in the UI?
ans:implement the try and catch to show the error,and more we can render the error aslo when error occurs.

3.How would you prevent unnecessary re-renders in this component?
ans) a)Empty dependency array in useEffect ensures fetch runs only
     b)Memoize child components like <CarItem /> if they’re expensive:
     c)Use keys correctly in .map() to avoid React diffing issues.
     d)if carList gets large, implement pagination or virtualization.
     e)Avoid state updates unless data actually changes:
4.What does .leftJoin(CarImages, eq(...)) do, and why is it used here?
ans:)a)joins the CarListing table with CarImages using the car ID.
    b)A left join ensures all cars are fetched — even those without images.
    c)t’s used here so that the UI can still show car listings even if they don’t have associated images yet (image can be optional).

5.What’s the difference between .select().from(...).limit(...) vs using pagination like .offset(...).limit(...)?
ans:)    Difference Between .limit(...) and .offset(...).limit(...) is 
   a).limit(10)
    What it does:
    Fetches only the first 10 rows from the result.
    Use case:
    You just want to display the latest or top N records.
    This will always return the same 10 rows (e.g., latest 10 cars if sorted by id desc).
    b).offset(20).limit(10)
    What it does:
    Skips a number of rows (offset) and then fetches the next set (limit).
    Use case:
    Used in pagination — to fetch page-wise data.
    This skips the first 20 rows and returns the next 10 → items 21–30.
6)How would you modify the query to get the top 10 most viewed cars instead of the most recent?
ans:)You’d need a column like views or viewCount in your CarListing table.
     Modify the sort to use that:
     .orderBy(desc(CarListing.viewCount)).limit(10)
7)How would you implement lazy loading or infinite scrolling for this list?
ans):Lazy Loading:
     Load only a few car items initially.
    As the user scrolls or navigates the carousel, fetch more data (or reveal already-loaded but hidden data).
    How to implement:
    Maintain page state.
    In useEffect, fetch more cars when user reaches end.
     Use Intersection Observer API or onScroll.
8)🚗 1. What would you do if you needed to display thousands of cars?
Answer:
Use pagination or infinite scroll: Load 10–20 cars at a time instead of all at once.
Implement virtual scrolling: Only render what's visible in the viewport using libraries like react-window or react-virtualized.
Lazy-load images: Only load car images when they are close to appearing on screen.

📌 Goal: Reduce DOM nodes and memory usage.

9)How would memoization (useMemo, React.memo) help in this case?
ans)React.memo(Component) prevents re-rendering of components (like <CarItem />) if their props haven't changed.
    useMemo(() => computeSomething(), [deps]) caches expensive calculations (e.g., formatting or sorting cars),Recomputes only if the dependencies (deps) change.
10)Would it be better to prefetch car images? Why or why not?
ans;)✅ Yes, if:
   You know what images will be needed soon (e.g., next carousel slide).
   Your app runs on fast networks or CDNs.
   ❌ No, if:
   Too many images → memory & bandwidth waste.
   May slow down first-page load.
   Best practice: Use loading="lazy" on <img> and prefetch only next few images.
11)⏱️ 5. How would you measure and optimize the page load time of this component?
Answer:
✅ Tools:
Chrome DevTools (Performance tab)
Lighthouse (audit)
React Profiler
✅ Metrics to check:
First Contentful Paint (FCP)
Time to Interactive (TTI)
Largest Contentful Paint (LCP)
✅ Optimizations:
Split code using dynamic import() (lazy load components like CarItem)
Reduce unused JavaScript/CSS.
Compress and cache images
Minimize re-renders using memoization and stable props
12) What would be the impact of not debouncing your database query if the user could filter/search cars?
Answer:Sends a query for every keystroke → results in:
❌ Too many DB hits (wasted load)
❌ Laggy UI
❌ Rate-limit or crash risk
FIX:Sends a query for every keystroke → results in:
❌ Too many DB hits (wasted load)
❌ Laggy UI
❌ Rate-limit or crash risk
13). What are the risks of directly exposing DB queries from the frontend?
🚫 Exposes sensitive logic: Attackers can inspect JS and reverse engineer endpoints or data structure.

🛑 Security vulnerabilities: Potential for unauthorized access, data leaks, or injection attacks.

🔄 No central control: Difficult to audit or enforce access control policies.

✅ Best practice: Always access databases through server-side APIs with authentication and validation.

14). How would you prevent SQL injection with the query here?
You're using Drizzle ORM, which automatically:

Uses parameterized queries (not string concatenation)

Escapes input values safely

✅ So, Drizzle provides built-in SQL injection protection.

If writing raw SQL, always use parameterized placeholders (WHERE name = ?) and avoid direct string interpolation.
15)How would you secure this page to authenticated users only?
Use an authentication provider (e.g., Firebase Auth, Clerk, NextAuth).
Wrap the page/component with an auth guard:
Secure backend endpoints with auth checks:
Verify JWT/session token before serving data.
*/