import React from 'react';

function WelcomePage({ startRecipe }) {
    return (
        <div className="welcome-page">
            <h1>Welcome to the Food Impacts application</h1>
            <button onClick={startRecipe}>Start Your Recipe</button>
        </div>
    );
}

export default WelcomePage;