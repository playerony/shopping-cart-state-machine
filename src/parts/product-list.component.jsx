import React from 'react';

import { ProductQuantity } from '.';

export const ProductList = ({ isChecking, products = [], onProductQuantityClick }) => (
  <ul>
    {React.Children.toArray(
      products.map((_product) => (
        <li className="row">
          {`${_product.name}, cena: ${_product.price}zł`}
          <ProductQuantity
            {..._product}
            onClick={onProductQuantityClick(_product)}
            isBlocked={isChecking || _product.isBlocked}
          />
        </li>
      )),
    )}
  </ul>
);
