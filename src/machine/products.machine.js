import { assign, createMachine } from 'xstate';

const invokeFetch = () => fetch('/api/cart').then((response) => response.json());

const assignProducts = assign({
  lastUpdated: () => Date.now(),
  products: (_, event) => event.data,
});

export const productsMachine = createMachine({
  initial: 'idle',
  id: 'products-machine',
  context: {
    products: null,
    lastUpdated: null,
  },
  states: {
    idle: {
      on: {
        FETCH: 'loading',
      },
    },
    loading: {
      invoke: {
        src: invokeFetch,
        id: 'fetch-products-machine',
        onDone: {
          target: 'loaded',
          actions: assignProducts,
        },
        onError: 'failure',
      },
    },
    loaded: {
      on: {
        REFRESH: 'loading',
      },
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
});
