import React, { useState } from 'react';

function RecipeForm({ availableIngredients, addIngredient, completeRecipe }) {
    const [ingredient, setIngredient] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setIngredient(value);

        if (value) {
            const filteredSuggestions = availableIngredients.filter((ing) =>
                ing.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setIngredient(suggestion);
        setSuggestions([]);
    };

    const handleAddIngredient = () => {
        addIngredient({ ingredient, quantity, unit });
        setIngredient('');
        setQuantity('');
        setUnit('');
    };

    return (
        <div className="recipe-form">
            <h2>Add an Ingredient</h2>
            <div className="input-group">
                <div className="search-bar">
                    <input
                        type="text"
                        value={ingredient}
                        onChange={handleInputChange}
                        placeholder="Search for an ingredient"
                    />
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Quantity"
                />
                <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                >
                    <option value="">Select Unit</option>
                    <option value="g">grams</option>
                    <option value="ml">milliliters</option>
                </select>
                <button onClick={handleAddIngredient}>Add Ingredient</button>
            </div>
            <button className="complete-recipe-button" onClick={completeRecipe}>Complete Recipe</button>
        </div>
    );
}

export default RecipeForm;