import InputField from '@/add-listing/components/InputField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
/*
tip: page is not responsive make it responsive.

🔍 What This Component Does (in short):
The FinanacialCalculator component lets users input car financing details and calculates their monthly loan payment based on:
Car price
Interest rate
Loan term (in months)
Down payment

How It Works:
User Input:
Inputs are collected via useState() hooks (carPrice, intrestRate, loanTerm, downPayment).

Monthly Payment Calculation:
On clicking Calculate, it computes the monthly EMI using the loan formula:
EMI=𝑃⋅𝑟⋅(1+𝑟)^𝑛/(1+𝑟)^𝑛−1
Where:
P is the loan principal (carPrice - downPayment)
r is the monthly interest rate (intrestRate / 1200)
n is loan term in months
Monthly Interest Rate(decimal value)=APR(annual percentage rate)/1200*APR;
​
Display:
If a monthly payment is calculated, it's shown below the form.

*/
function FinanacialCalculator({carDetail}) {

    const [carPrice,setCarPrice]=useState(0);
    const [intrestRate,setIntrestRate]=useState(0);
    const [loanTerm,setLoanTerm]=useState(0);
    const [downPayment,setDownPayment]=useState(0);
    const [monthlyPayment,setMonthlyPayment]=useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [isValid, setIsValid] = useState(false);

const handleCarPriceChange = (e) => {
  const value = Number(e.target.value);
  if (value < 0) return;
  setCarPrice(value);
  validateForm(value, intrestRate, loanTerm, downPayment);
};

const handleInterestRateChange = (e) => {
  const value = Number(e.target.value);
  if (value < 0) return;
  setIntrestRate(value);
  validateForm(carPrice, value, loanTerm, downPayment);
};

const handleLoanTermChange = (e) => {
  const value = Number(e.target.value);
  if (value < 0) return;
  setLoanTerm(value);
  validateForm(carPrice, intrestRate, value, downPayment);
};

const handleDownPaymentChange = (e) => {
  const value = Number(e.target.value);
  if (value < 0) return;
  setDownPayment(value);
  validateForm(carPrice, intrestRate, loanTerm, value);
};

const validateForm = (price, rate, term, down) => {
  if (price <= 0 || rate <= 0 || term <= 0 || down < 0 || down > price) {
    setIsValid(false);
    setErrorMsg('Please ensure all fields are positive and down payment is less than price.');
  } else {
    setIsValid(true);
    setErrorMsg('');
  }
};
    const CalculateMonthlyPayment=()=>{
        if (!isValid) return;
        console.log(carPrice,intrestRate,loanTerm,downPayment);
        const Principal=carPrice-downPayment;
        const MonthlyInterestRate=intrestRate/1200 // Convert to Decimal;
       // You're converting an annual percentage rate (APR) into a monthly decimal interest rate.
       if (loanTerm <= 0 || MonthlyInterestRate === 0) {
      setErrorMsg('⚠️ Please make sure loan term and interest rate are greater than 0');
      setMonthlyPayment(0);
      return;
    }
       setErrorMsg('');
        const MonthlyPayment=(Principal*MonthlyInterestRate*Math.pow(1+MonthlyInterestRate,loanTerm))/
        (Math.pow(1+MonthlyInterestRate,loanTerm)-1);

        setMonthlyPayment(MonthlyPayment.toFixed(2))
    }
  

  return (
    <div className='p-10 border rounded-xl shadow-md mt-7'>
        <h2 className='font-medium text-2xl'>Financial Calculator</h2>
        <div className='flex gap-5 mt-5'>
            <div className="w-full" >
                <label>Price $</label>
                <Input type="number" onChange={handleCarPriceChange} />
            </div>
            <div className="w-full" >
                <label>Interest Rate</label>
                <Input type="number" onChange={handleInterestRateChange} />
            </div>
        </div>
        <div className='flex gap-5 mt-5'>
            <div className="w-full" >
                <label>Loan Term (Months)</label>
                <Input type="number" onChange={handleLoanTermChange} />
            </div>
            <div className="w-full" >
                <label>Down Payment</label>
                <Input type="number" onChange={handleDownPaymentChange}/>
            </div>
        </div>
         {/* Error Message */}
      {errorMsg && (
        <p className="text-red-600 text-sm mt-3">{errorMsg}</p>
      )}
      {/* Result */}
       {monthlyPayment>0&& <h2 className='font-medium text-2xl mt-5'>Your Monthly Payment Is : 
       <span className='text-4xl font-bold'>${monthlyPayment}</span></h2>}
        <Button className="w-full mt-5" size="lg"
        onClick={CalculateMonthlyPayment}
        >Calculate</Button>
    </div>
  )
}

export default FinanacialCalculator

/**
 ⚠️ 2. What would happen if loanTerm is 0? How would you prevent divide-by-zero errors?

 🧠 3. Why are individual pieces of state used for each input (price, interest rate, etc.) instead of a single object?
Using individual useState calls keeps each input's state simple and isolated, which makes it easier to track and update independently.
An alternative is a single useState({ carPrice, interestRate, ... }) — more scalable but requires spread syntax for updates.
✅ Choose individual state for simplicity.
🧱 Choose object state if the form grows large and you want centralized handling.

🚫 4. What happens if a user enters a negative number? How would you validate the fields?

💡 5. Could this calculator benefit from useMemo? If so, how?
Yes — you could use useMemo to memoize the EMI calculation if inputs are changed frequently:
const monthlyPayment = useMemo(() => calculateEMI(), [carPrice, interestRate, loanTerm, downPayment]);
It helps avoid recalculating EMI unnecessarily unless inputs change.

⚖️ 6. Would it be better to calculate EMI live (on input change) or on button click? Why?
Live calculation: Better UX, immediate feedback. But more CPU work, especially with debounce needed.
Button click: Explicit and lightweight. Good when users may partially fill form.

📱 8. How would you improve accessibility (screen readers, keyboard nav)?
Use proper <label htmlFor="inputId">
Provide aria-label or aria-describedby if needed
Ensure all fields are tabbable
Use semantic tags and headings

💰 9. If car price is pre-filled from listing, how would you sync it with state?
answer:)Use a prop like defaultPrice:
useEffect(() => {
  if (defaultPrice) setCarPrice(defaultPrice);
}, [defaultPrice]);
This ensures it syncs once on mount.

🔁 10. Could this component be reused outside car listings (e.g., home loans)? What would you abstract out?
Yes. To make it reusable:
Accept defaultValues prop
Move EMI logic to a shared utility function
Rename labels and props (e.g., “Price” → “Loan Amount”)
Make it schema-driven (field config array)

🧱 11. If the form grows (e.g., taxes, insurance), how would you restructure state?
ans:) Switch to a single object state:
const [formData, setFormData] = useState({
  carPrice: 0,
  interestRate: 0,
  loanTerm: 0,
  downPayment: 0,
  insurance: 0,
});
Or use form libraries like React Hook Form for better scalability and validation.

🧪 12. How would you test the EMI calculator function?
ans:)Move EMI logic to a utility function like calculateEMI(principal, rate, term) and write unit tests for it:
expect(calculateEMI(500000, 8, 60)).toBeCloseTo(expectedValue);
Use tools like Jest for unit tests.

🔍 13. What test cases would you include?
Normal values (positive price, rate, term)
Edge cases:
loanTerm = 0
interest = 0
down payment > car price
very high interest or term
floating-point precision checks


 */