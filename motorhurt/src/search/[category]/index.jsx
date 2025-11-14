import Header from '@/components/Header'
import Search from '@/components/Search'
import { db } from './../../../configs';
import { CarImages, CarListing } from './../../../configs/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Service from '@/Shared/Service';
import CarItem from '@/components/CarItem';

function SearchByCategory() {

    const {category}=useParams();
    //It reads the :category value from the URL (e.g., /search-category/SUV → category = "SUV").
    const [carList,setCarList]=useState([]);

    useEffect(()=>{
        GetCarList();
    },[])
    //Calls GetCarList() once when the component is mounted.
   

    /*
    Fetches cars that match the category from CarListing table.
    Joins each car with its corresponding image (CarImages).
    Formats the result using Service.FormatResult() (likely to flatten/join the data).
    Stores the final car list in carList
    */


    const GetCarList=async()=>{
        const result=await db.select().from(CarListing)
        .innerJoin(CarImages,eq(CarListing.id,CarImages.carListingId))
        .where(eq(CarListing.category,category))

        const resp=Service.FormatResult(result);
        setCarList(resp);
    }
     
  return (
    <div>
        <Header/>

        <div className='p-16 bg-black flex justify-center'>
            <Search/>
        </div>
        <div className='p-10 md:px-20'>
            <h2 className='font-bold text-4xl '>{category}</h2>

            {/* List of CarList  */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-7'>
                {/*
                If carList is fetched:
                Shows the matching cars using <CarItem />.
                If not yet loaded:
                Shows animated gray boxes as loading placeholders.
                */}
                {carList?.length>0? carList.map((item,index)=>(
                    <div key={index}>
                        <CarItem car={item} />
                    </div>
                )):
                [1,2,3,4,5,6].map((item,index)=>(
                    <div className='h-[320px] rounded-xl bg-slate-200 animate-pulse'>
                    </div>
                ))
                }
            </div>
        </div>
    </div>
  )
}

export default SearchByCategory


/*
1)How does useParams() work in React Router, and what type of routes require it?
Answer:
useParams() is a React Router hook that allows you to access the dynamic parts of the URL (route parameters).
It returns an object containing key-value pairs of route parameters defined in the route path.
If the URL is /search-category/SUV, then:
const { category } = useParams(); // category = "SUV"
You need to extract values directly embedded in the route path (not query strings).

2)What would happen if someone manually entered a non-existing category in the URL?
ans)The category param will still be extracted by useParams(), so the component will run normally.
However, since UnknownType doesn’t exist in your DB, the query will return an empty result ([]).
The user will likely see the loading skeletons disappear, but no cars will render.

3) How would you handle invalid or non-existent categories in the UI?
answer:)There are multiple ways to handle it gracefully:
  a)Option 1: Show a fallback message saying No cars found in this category.
  b) Option 2: Redirect to a NotFound or fallback page
  c)Option 3: Offer suggestions ->Show alternative categories or popular cars if results are empty.
  d) option 4:frontend validation before query(if we already have fixed list of valid categories validate against it before calling the database.)
  e)option 5:  API-Level Validation (Recommended for Scalability)->If categories are dynamic or stored in the DB:
    
    const validCategories = await db.selectDistinct().from(CarListing).pluck('category');
    if (!validCategories.includes(req.query.category)) {
       return res.status(400).json({ message: "Invalid category" });
      }
4)How would you modify the Drizzle query to fetch cars by category and also within a certain price range (e.g., 5L–15L)?

5)What changes would be needed to sort cars within a category by popularity or price descending?

6)If the category value from useParams() changes (e.g., via a Link), would this component update? Why or why not?
Answer:
No, it won't automatically fetch new data unless you handle it.
Why:
useEffect(() => { GetCarList(); }, []) only runs once — when the component first mounts.
If category changes while the component is already mounted (like navigating via a <Link> to the same component with a different category), the effect won’t re-run.
✅ Fix: Add category as a dependency to the useEffect:

7)2. What happens if category is undefined or missing? How would you guard against that?
If undefined:
The query becomes .where(eq(CarListing.category, undefined)), which is invalid or returns nothing.
No cars will be shown, or worse — it could throw a runtime error depending on DB strictness.
✅ Fix: Guard with an early return:
    if (!category) {
         return <div className="text-center mt-10 text-red-500">Category is missing or invalid.</div>;
      }
    Or skip the query:
   if (!category) return;
   const result = await db.select().from(CarListing)
     .where(eq(CarListing.category, category))

8)Why does this component use loading skeletons instead of a spinner or “Loading…” text?
Answer:
Skeleton loaders visually mimic the final layout, reducing perceived wait time.
They keep space reserved for content, preventing layout shifts.
Improves UX, especially for content-heavy grids like car cards.
🟢 Better than spinners when loading multiple repeatable items like cards.

9)If there are 5000 cars under one category, how would you paginate this efficiently?


10) what are sever side componenent and client side components, what is your project is?
ans) see the video of piyush garg.
11) Would you consider Server-Side Rendering (SSR) for this component? Why or why not?what is ssr,ssg,ssg,seo,csr?
12) what is first paint?
13) what does rendering on server mean ?


❓ What does “rendering” mean?
✅ Rendering = converting data into visible UI (HTML + CSS that the browser can display)or(Turning your React components + data into visible HTML)

⚡ With Server-Side Rendering (SSR):
1.Server runs your React code on the server
2.It fetches data, builds the final HTML
3.Sends HTML to the browser like:
<div id="root">
  <h1>Most Searched Cars</h1>
  <div class="car-item">BMW</div>
  ...
</div>
4.Page looks ready instantly
5.Then JS loads & makes page interactive
Instant content visible, even before JS loads!

🔁 With Client-Side Rendering (CSR) (your current React + Vite setup):
1.Server sends a blank HTML shell →
<div id="root"></div>
2.Browser downloads JavaScript bundle
3.JS runs, React mounts
4.useEffect fetches data (e.g., from DB or API)
5.React renders components → UI appears
⏱️ ❌ Takes time — users see a blank page initially



1. Is it safe to trust the category param directly in your DB query?
❌ No, it’s not fully safe to blindly trust any user input, even if you're using a typed ORM like Drizzle.
Even though Drizzle prevents raw SQL injection (by compiling queries safely), a malformed or unexpected category can still:
Break app logic
Trigger unexpected behavior
Return empty or unintended results
✅ You should validate or sanitize the input first.

2. How would you prevent injection or malformed input in the category param?
answer:)a) Validate category against a known list:
b) Avoid raw SQL or string concatenation:
Drizzle uses parameterized queries, which already prevent SQL injection like: 
SELECT * FROM cars WHERE category = 'SUV'; -- safe
c) Sanitize if needed (e.g., trimming strings, escaping characters).


3. Is it a good practice to fetch data directly inside a component like this?
🔸 In small projects: Yes, it's fine to fetch directly in the component.
🔸 In large apps: ❌ It becomes messy and tightly coupled.
✅ Better Design for Larger Apps:
Move fetch logic into a separate service (e.g., /services/carService.js)
Use custom hooks like:
const { data, loading, error } = useCarListByCategory(category);
➡ This separates data layer from UI layer, making the app:
More testable
More maintainable
Easier to share logic

4. what does tight coupling and loose coupling in this context?
answer:)
Tight coupling means that your component depends too closely on the logic inside it, like database queries, state management, or business rules.
🧩 In your code:

useEffect(() => {
  const result = await db.select().from(CarListing)...
  setCarList(result)
}, [])
Here, your UI component (SearchByCategory) directly talks to the database. This is tight coupling because:
The UI depends on database logic
It’s hard to test the component in isolation
You can’t reuse the logic elsewhere (e.g., another page)

✅ Why loose coupling is better:
Loose coupling separates:
📦 Data fetching (in a service or custom hook)
🎨 UI rendering (in the component)
That way:
The UI just displays data
The fetch logic can be reused, tested, or replaced independently
✅ Fix:
Extract the fetch logic:
const { cars } = useCarListByCategory(category);
Now the component just renders, and fetching logic is in a separate reusable, testable module.

18)How would you extract the data fetching logic into a reusable hook?

*/