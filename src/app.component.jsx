import React from 'react';
import { useMachine } from '@xstate/react';

import { ProductQuantity } from './product-quantity.component';

import { productsMachine } from './products.machine';

export function App() {
  const [current, send] = useMachine(productsMachine);

  const sendRetry = () => send('RETRY');

  const onProductQuantityClick = (product) => (action) => () => send(action, { product });

  function renderProductsList() {
    if (current.matches('loading')) {
      return <div>Ładowanie listy produktów...</div>;
    }

    if (current.matches('failure')) {
      return (
        <div>
          Nie udało się pobrac listy produktów...
          <button type="button" onClick={sendRetry}>
            Spróbuj pobrać listę produktów ponownie
          </button>
        </div>
      );
    }

    if (current.context.products) {
      return (
        <ul>
          {React.Children.toArray(
            current.context.products.map((_product) => (
              <li className="row">
                {`${_product.name}, cena: ${_product.price}zł`}
                <ProductQuantity {..._product} onClick={onProductQuantityClick(_product)} />
              </li>
            )),
          )}
        </ul>
      );
    }

    return null;
  }

  return (
    <div className="container">
      <h3>Lista produktów</h3>
      {renderProductsList()}
    </div>
  );
}
