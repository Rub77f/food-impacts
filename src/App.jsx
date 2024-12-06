import { useState } from 'react'
import macroNutImage from './assets/macronutrients.jfif'
import carbonFootprint from './assets/carbonfootprint.jfif'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href='https://ciqual.anses.fr/' target="_blank">
        <img src={macroNutImage} className="logo macronutrients" alt="Macro Nutrients logo" />
        </a>
        <a href='https://doc.agribalyse.fr/documentation' target="_blank">
        <img src={carbonFootprint} className="logo carbonfootprint" alt="Carbon Footprint logo" />
        </a>
      </div>
      <h1>food impacts</h1>
      <p className="click-on-the-pics">
        Click on the pictures to learn more
      </p>
    </>
  )
}

export default App
