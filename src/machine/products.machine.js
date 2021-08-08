import { assign, createMachine } from 'xstate';

const fetchProductsState = {
  initial: 'loading',
  id: 'fetch-products',
  states: {
    loading: {
      invoke: {
        src: 'getProductsList',
        onDone: {
          target: 'loaded',
          actions: 'assignProducts',
        },
        onError: 'failure',
      },
    },
    loaded: {
      type: 'final',
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
  onDone: 'manage-products',
};

const manageProductsState = {
  initial: 'idle',
  id: 'manage-products',
  states: {
    idle: {
      on: {
        INCREASE_QUANTITY: 'increase',
        DECREASE_QUANTITY: 'decrease',
      },
    },
    increase: {
      invoke: {
        src: 'checkIncreasedProductQuantity',
        onDone: {
          target: 'idle',
          actions: 'updateProductQuantity',
        },
      },
    },
    decrease: {
      invoke: {
        src: 'checkDecreasedProductQuantity',
        onDone: {
          target: 'idle',
          actions: 'updateProductQuantity',
        },
      },
    },
  },
};

export const findProductIndexByPid = (products, pid) =>
  products.findIndex((_product) => _product.pid === pid);

const checkProductQuantityDecorator =
  (onQuantityChange) =>
  (_, { product }) => {
    const newQuantity = onQuantityChange(product.quantity);
    const body = { pid: product.pid, quantity: newQuantity };

    return fetch('/api/product/check', {
      method: 'POST',
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((response) => ({ product: { ...product, ...body }, response }));
  };

export const productsMachine = createMachine(
  {
    id: 'products',
    initial: 'fetch-products',
    context: {
      products: null,
    },
    states: {
      'fetch-products': fetchProductsState,
      'manage-products': manageProductsState,
    },
  },
  {
    actions: {
      assignProducts: assign({
        products: (_, event) =>
          event.data.map((_product) => ({
            ..._product,
            quantity: _product.min,
          })),
      }),
      updateProductQuantity: assign({
        products: ({ products }, { data: { product, response } }) => {
          const copiedProducts = products.slice();
          const foundProductIndex = findProductIndexByPid(copiedProducts, product.pid);
          const foundProduct = copiedProducts[foundProductIndex];

          foundProduct.quantity = response.isError ? foundProduct.min : product.quantity;

          copiedProducts[foundProductIndex] = foundProduct;

          return copiedProducts;
        },
      }),
    },
    services: {
      getProductsList: () => fetch('/api/cart').then((response) => response.json()),
      checkIncreasedProductQuantity: checkProductQuantityDecorator((quantity) => quantity + 1),
      checkDecreasedProductQuantity: checkProductQuantityDecorator((quantity) => quantity - 1),
    },
  },
);
