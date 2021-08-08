import React from 'react';
import debounce from 'lodash.debounce';
import { useMachine } from '@xstate/react';

import { ProductList } from './parts';
import { productsMachine } from './machine/products.machine';

export function App() {
  const [current, send] = useMachine(productsMachine);

  const sendRetry = () => send('RETRY');

  const isChecking =
    current.matches('manage-products.increase') || current.matches('manage-products.decrease');

  const onProductQuantityClick = (product) => (action) =>
    debounce(() => send(action, { product }), 500);

  function renderProductsList() {
    if (current.matches('fetch-products.loading')) {
      return <div>Ładowanie listy produktów...</div>;
    }

    if (current.matches('fetch-products.failure')) {
      return (
        <div>
          Nie udało się pobrać listy produktów...
          <button type="button" onClick={sendRetry}>
            Spróbuj pobrać listę produktów ponownie
          </button>
        </div>
      );
    }

    if (current.context.products) {
      return (
        <ProductList
          isChecking={isChecking}
          products={current.context.products}
          onProductQuantityClick={onProductQuantityClick}
        />
      );
    }

    return null;
  }

  function renderCartSum() {
    if (!current.context.products) {
      return null;
    }

    const cartSum = current.context.products.reduce((sum, _product) => {
      const priceAsNumber = Number(_product.price);
      const newSum = sum + _product.quantity * priceAsNumber;

      return newSum;
    }, 0);

    return <h3>{`Suma zamówienia: ${cartSum.toFixed(2)}zł`}</h3>;
  }

  return (
    <div className="container">
      <h1>Lista produktów</h1>
      {renderProductsList()}
      {renderCartSum()}
    </div>
  );
}
