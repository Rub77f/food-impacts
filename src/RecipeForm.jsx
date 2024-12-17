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
            <h2>Ajouter un ingredient</h2>
            <div className="input-group">
                <div className="search-bar">
                    <input
                        type="text"
                        value={ingredient}
                        onChange={handleInputChange}
                        placeholder="Entrer un ingredient"
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
                    placeholder="Quantite"
                />
                <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                >
                    <option value="">Selectionner une unite</option>
                    <option value="g">grammes</option>
                    <option value="ml">millilitres</option>
                </select>
                <button onClick={handleAddIngredient}>Ajouter</button>
            </div>
            <button className="complete-recipe-button" onClick={completeRecipe}>Recette complete !</button>
        </div>
    );
}

export default RecipeForm;