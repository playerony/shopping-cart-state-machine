import React from 'react';

export const ProductQuantity = ({ min, max, quantity, isBlocked, onClick }) => {
  const isMin = min >= quantity;
  const isMax = max <= quantity;

  return (
    <div className="product-quantity">
      <button type="button" disabled={isMax || isBlocked} onClick={onClick('INCREASE_QUANTITY')}>
        +
      </button>
      <button type="button" disabled={isMin || isBlocked} onClick={onClick('DECREASE_QUANTITY')}>
        -
      </button>
      <p>{`Obecnie masz ${quantity} sztuk produktu`}</p>
    </div>
  );
};
