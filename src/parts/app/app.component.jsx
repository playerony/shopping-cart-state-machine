import React, { useEffect } from 'react';
import { useMachine } from '@xstate/react';

import { productsMachine } from '../../machine/products.machine';

import './app.styles.css';

export function App() {
  const [current, send] = useMachine(productsMachine);

  useEffect(() => {
    send('FETCH');
  }, []);

  const sendRetry = () => send('RETRY');

  const sendRefresh = () => send('REFRESH');

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

    if (current.matches('loaded')) {
      return (
        <ul>
          {React.Children.toArray(
            current.context.products.map((_product) => (
              <li className="row">{`${_product.name}, cena: ${_product.price}zł`}</li>
            )),
          )}
        </ul>
      );
    }

    return null;
  }

  function renderRefreshButton() {
    if (current.matches('loaded')) {
      const formattedDate = new Date(current.context.lastUpdated).toISOString();

      return (
        <button type="button" onClick={sendRefresh}>
          {`Odśwież listę produktów (ostatnio odświeżono ${formattedDate})`}
        </button>
      );
    }

    return null;
  }

  return (
    <div className="container">
      {renderRefreshButton()}
      <h3>Lista produktów</h3>
      {renderProductsList()}
    </div>
  );
}
