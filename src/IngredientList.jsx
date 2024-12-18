import React from 'react';

function IngredientList({ ingredients, removeIngredient }) {
    return (
        <div className="ingredient-list">
            <h3 className="table-title">Liste d'ingredients</h3>
            {ingredients.length > 0 && (
                <table className="ingredient-table">
                    <tbody>
                        {ingredients.map((item, index) => (
                            <tr key={index}>
                                <td>{item.quantity} {item.unit} de {item.ingredient}</td>
                                <td>
                                    <button className="remove-button" onClick={() => removeIngredient(index)}>✖</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default IngredientList;