import { useState } from 'react'
import './App.css'

function App() {
  const [ingredient1, setIngredient1Value] = useState('')
  const [ingredient2, setIngredient2Value] = useState('')
  const [responseData, setResponseData] = useState(null)

  const ingredient1Change = (e) => {
    setIngredient1Value(e.target.value);
  }

  const ingredient2Change = (e) => {
    setIngredient2Value(e.target.value);
  }
  
  const handleClick = async () => {  
    try {
      // Create a new Headers object and set the 'Content-Type' to 'application/json'
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      // Create the JSON string from the input values
      let raw = JSON.stringify({"ingredient1": ingredient1, "ingredient2": ingredient2})

      // Define the request options including method, headers, body, and redirect behavior
      let requestOptions = {
        method: 'POST', // Method type
        headers: myHeaders, // Headers for the request
        body: raw, // The body of the request containing the JSON string
        redirect: 'follow' // Automatically follow redirects
      };
          
      const response = await fetch('https://u1m56zt6la.execute-api.eu-west-3.amazonaws.com/food-impacts-web-stage', requestOptions); 
      if (!response.ok) { 
        throw new Error(`HTTP error! Status: ${response.status}`); 
      }
      
      const data = await response.json();
      setResponseData(data);
      console.log('Response data:', data)
    }
    catch (error) { console.error('Error fetching data:', error); }
  }
  
  return (
    <>
      <div className='App'>
        <input type="text" value={ingredient1} onChange={ingredient1Change} placeholder="Enter ingredient 1"/>
        <input type="text" value={ingredient2} onChange={ingredient2Change} placeholder="Enter ingredient 2"/>
        <button onClick={handleClick}>Submit recipe</button>
        {responseData && ( 
          <div> 
            <h3> Response:</h3> 
            <pre>{JSON.stringify(responseData, null, 2)}</pre> 
          </div> )}
      </div>
    </>
  )
}

/*
        <a href='https://ciqual.anses.fr/' target="_blank">
        <img src={macroNutImage} className="logo macronutrients" alt="Macro Nutrients logo" />
        </a>
        <a href='https://doc.agribalyse.fr/documentation' target="_blank">
        <img src={carbonFootprint} className="logo carbonfootprint" alt="Carbon Footprint logo" />
        </a>
        <h1>food impacts</h1>
        <p className="click-on-the-pics">
          Click on the pictures to learn more
        </p>

                {responseData && ( 
          <div> 
            <h3> Response:</h3> 
            <pre>{JSON.stringify(responseData, null, 2)}</pre> 
          </div> )}
*/
export default App
