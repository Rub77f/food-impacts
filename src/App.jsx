import { useState, useEffect } from 'react'
import WelcomePage from './WelcomePage'; 
import RecipeForm from './RecipeForm'; 
import IngredientList from './IngredientList';
import './App.css'


function App() {
  const [isRecipeStarted, setIsRecipeStarted] = useState(false); 
  const [ingredients, setIngredients] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [responseTableData, setResponseTableData] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
        try {
            // Create a new Headers and body json string from the input values
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            // Define the request options including method, headers, body, and redirect behavior
            let requestOptions = {
              method: 'POST', // Method type
              headers: myHeaders, // Headers for the request
              body: JSON.stringify({'type':'all'}), // The body of the request containing the JSON string
              redirect: 'follow' // Automatically follow redirects
            };

            const response = await fetch('https://u1m56zt6la.execute-api.eu-west-3.amazonaws.com/food-impacts-web-stage/GetCiqualFoodList', requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const ciqualIngredientJson = await response.json();
            const ciqualIngredientList = JSON.parse(ciqualIngredientJson.body); // Adjusting to parse the body property
            setAvailableIngredients(ciqualIngredientList);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    fetchIngredients();
  }, []);

  const startRecipe = () => { setIsRecipeStarted(true); }; 
  
  const addIngredient = (ingredient) => { setIngredients([...ingredients, ingredient]); };
  
  const formatIngredients = (ingredients) => { 
    const formatted = {}; 
    ingredients.forEach((item, index) => {
      const i = index + 1; formatted[`ingredient${i}`] = item.ingredient; 
      formatted[`quantity${i}`] = item.quantity; 
      formatted[`unit${i}`] = item.unit; 
    }); 
    return formatted; 
  };

  const completeRecipe = async () => {  
    try {
      // Format the input
      const formattedIngredients = formatIngredients(ingredients)

      // Create a new Headers and body json string from the input values
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      let body = JSON.stringify(formattedIngredients)

      // Define the request options including method, headers, body, and redirect behavior
      let requestOptions = {
        method: 'POST', // Method type
        headers: myHeaders, // Headers for the request
        body: body, // The body of the request containing the JSON string
        redirect: 'follow' // Automatically follow redirects
      };
      
      // Call AWS lambda function and collect json response
      const response = await fetch('https://u1m56zt6la.execute-api.eu-west-3.amazonaws.com/food-impacts-web-stage', requestOptions); 
      if (!response.ok) { 
        throw new Error(`HTTP error! Status: ${response.status}`); 
      }
      
      const data = await response.json();
      const parsedData = JSON.parse(data.body);
      setResponseTableData(parsedData);
      console.log('Response data:', parsedData)
    }
    catch (error) { 
      console.error('Error fetching data:', error);
    }
  }

  const removeIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <>
      <div className="App">
        {isRecipeStarted ? (
          <div className="recipe-container">
            {ingredients.length > 0 && (
              <IngredientList ingredients={ingredients} removeIngredient={removeIngredient} />
            )}
            <RecipeForm
              availableIngredients={availableIngredients}
              addIngredient={addIngredient}
              completeRecipe={completeRecipe}
            />
          </div>
        ) : (
          <WelcomePage startRecipe={startRecipe} />
        )}
        {Object.keys(responseTableData).length > 0 && (
          <div className="nutrition-table-container">
            <h3>Nutrition table</h3>
            <table className="nutrition-table">
              <thead>
                <tr>
                  <th>Aliment</th>
                  <th>Quantité</th>
                  <th>Energie (kcal)</th>
                  <th>Protéines (g)</th>
                  <th>Glucides (g)</th>
                  <th>Lipides (g)</th>
                  <th>Sucres (g)</th>
                  <th>Fibres alimentaires (g)</th>
                  <th>AG saturés (g)</th>
                  <th>AG monoinsaturés (g)</th>
                  <th>AG polyinsaturés (g)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(responseTableData).map(([ingredient, nutrients], index) => {
                    return (
                      <tr key={index}>
                        <td>{ingredient}</td>
                        <td>{nutrients["QuantityUnit"]}</td>
                        <td>{nutrients["Energie (kcal)"]}</td>
                        <td>{nutrients["Protéines (g)"]}</td>
                        <td>{nutrients["Glucides (g)"]}</td>
                        <td>{nutrients["Lipides (g)"]}</td>
                        <td>{nutrients["Sucres (g)"]}</td>
                        <td>{nutrients["Fibres alimentaires (g)"]}</td>
                        <td>{nutrients["AG saturés (g)"]}</td>
                        <td>{nutrients["AG monoinsaturés (g)"]}</td>
                        <td>{nutrients["AG polyinsaturés (g)"]}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default App;

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