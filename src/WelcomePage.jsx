import React from 'react';

function WelcomePage({ startRecipe }) {
    return (
        <div className="welcome-page">
            <h1>Welcome to the Food Impacts application</h1>
            <text>
                <p>Enter the ingredients for your recipe and we will show you both the macro nutrients as well as the carbon impact of your recipe</p>
            </text>
            <button onClick={startRecipe}>Start Your Recipe</button>
        </div>
    );
}

export default WelcomePage;