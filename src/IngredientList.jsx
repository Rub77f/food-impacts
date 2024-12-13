import React from 'react';

function IngredientList({ ingredients }) {
    return (
        <div className="ingredient-list">
            <h2>Ingredients</h2>
            <ul>{ingredients.map((item, index) => (
                    <li key={index}>{item.quantity} {item.unit} of {item.ingredient}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default IngredientList;