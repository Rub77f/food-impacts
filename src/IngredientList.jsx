import React from 'react';

function IngredientList({ ingredients, removeIngredient }) {
    return (
        <div className="ingredient-list">
            {ingredients.length > 0 && 
            <h2>Ingredients</h2>}
            <ul>
                {ingredients.map((item, index) => (
                    <li key={index}>
                        {item.quantity} {item.unit} de {item.ingredient}
                        <button className="remove-button" onClick={() => removeIngredient(index)}>✖</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default IngredientList;