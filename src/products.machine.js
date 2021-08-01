import { assign, createMachine } from 'xstate';

const assignProducts = assign({
  products: (_, event) =>
    event.data.map((_product) => ({
      ..._product,
      quantity: _product.min,
    })),
});

const findProductIndexByPid = (products, pid) =>
  products.findIndex((_product) => _product.pid === pid);

const changeProductQuantity = assign({
  products: ({ products }, { data: { product, response } }) => {
    const copiedProducts = products.slice();

    const foundProductIndex = findProductIndexByPid(copiedProducts, product.pid);
    const foundProduct = copiedProducts[foundProductIndex];

    if (response.isError) {
      foundProduct.quantity = foundProduct.min;
    } else {
      foundProduct.quantity = product.quantity;
    }

    copiedProducts[foundProductIndex] = foundProduct;

    return copiedProducts;
  },
});

const cartManagerState = {
  initial: 'idle',
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
          actions: changeProductQuantity,
        },
      },
    },
    decrease: {
      invoke: {
        src: 'checkDecreasedProductQuantity',
        onDone: {
          target: 'idle',
          actions: changeProductQuantity,
        },
      },
    },
  },
};

const fetchProductsState = {
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: 'getProductsList',
        onDone: {
          target: 'loaded',
          actions: assignProducts,
        },
        onError: 'failure',
      },
    },
    loaded: {
      ...cartManagerState,
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
};

const checkProductQuantity =
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
    initial: 'fetch-products',
    id: 'products-machine',
    context: {
      products: null,
    },
    states: {
      'fetch-products': {
        ...fetchProductsState,
      },
    },
  },
  {
    services: {
      checkIncreasedProductQuantity: checkProductQuantity((quantity) => quantity + 1),
      checkDecreasedProductQuantity: checkProductQuantity((quantity) => quantity - 1),
      getProductsList: () => fetch('/api/cart').then((response) => response.json()),
    },
  },
);
