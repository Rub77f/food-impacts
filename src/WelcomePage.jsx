import React from 'react';

function WelcomePage({ startRecipe }) {
    return (
        <div className="welcome-page">
            <h1>Bienvenue sur cette application de recette</h1>
            <text>
                <p>Entrez les differents ingredients de votre recette et l'application vous retournera les nutriments macro ainsi que l'impact carbone par ingredient</p>
            </text>
            <button onClick={startRecipe}>Commencer !</button>
        </div>
    );
}

export default WelcomePage;