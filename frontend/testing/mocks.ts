// mocks.ts
import type {
  Product,
  ProductCategory,
  PaColor,
  SimpleProduct,
  VariableProduct,
} from '@woographql/graphql';

import { ProductTypesEnum, StockStatusEnum } from '@woographql/graphql';
export const products = [
  {
    id: '1',
    name: 'T Shirt',
    slug: 't-shirt',
    price: '$10.00',
    rawPrice: 10,
    type: 'simple',
    productCategories: {
      nodes: [
        {
          id: '1',
          name: 'Clothing',
          slug: 'clothing',
        },
      ],
    },
    paColors: {
      nodes: [
        {
          id: '1',
          name: 'Red',
          slug: 'red',
        },
      ],
    },
  },
  {
    id: '2',
    name: 'Belt',
    slug: 'belt',
    price: '$20.00',
    rawPrice: 20,
    type: 'simple',
    productCategories: {
      nodes: [
        {
          id: '2',
          name: 'Accessories',
          slug: 'accessories',
        },
      ],
    },
    paColors: {
      nodes: [
        {
          id: '2',
          name: 'Blue',
          slug: 'blue',
        },
      ],
    },
  },
  {
    id: '3',
    name: 'Shoes',
    slug: 'shoes',
    price: '$30.00',
    rawPrice: 30,
    type: 'simple',
    productCategories: {
      nodes: [
        {
          id: '1',
          name: 'Clothing',
          slug: 'clothing',
        },
      ],
    },
    paColors: {
      nodes: [
        {
          id: '1',
          name: 'Red',
          slug: 'red',
        },
      ],
    } 
  },
  {
    id: '4',
    name: 'Hat',
    slug: 'hat',
    price: '$40.00',
    rawPrice: 40,
    type: 'simple',
    productCategories: {
      nodes: [
        {
          id: '2',
          name: 'Accessories',
          slug: 'accessories',
        },
      ],
    },
  } as unknown,
] as Product[];

export const categories = [
  {
    id: '1',
    name: 'Clothing',
    slug: 'clothing',
  },
  {
    id: '2',
    name: 'Accessories',
    slug: 'accessories',
  },
] as ProductCategory[];

export const colors = [
  {
    id: '1',
    name: 'Red',
    slug: 'red',
  },
  {
    id: '2',
    name: 'Blue',
    slug: 'blue',
  },
  {
    id: '3',
    name: 'Green',
    slug: 'green',
  },
  {
    id: '4',
    name: 'Yellow',
    slug: 'yellow',
  },
] as PaColor[];


export const product = {
  id: '1',
  name: 'T Shirt',
  slug: 't-shirt',
  shortDescription: 'Short description 1',
  description: 'Description 1',
  price: '$10.00',
  rawPrice: 10,
  type: 'simple',
  soldIndividually: false,
  stockStatus: 'instock',
  stockQuantity: 10,
  manageStock: true,
  attributes: {
    nodes: [
      {
        id: '1',
        name: 'Attribute 1',
        value: 'Value 1',
      },
    ],
  },
} as unknown as Product;

export const mockedMenu = [
  {
    label: 'Clothing',
    href: '/clothing',
  },
  {
    label: 'Accessories',
    href: '/accessories',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export const mockedSimpleProduct = {
  id: 'testProductId',
  name: 'Test Product',
  databaseId: 1,
  slug: 'test-product',
  type: ProductTypesEnum.SIMPLE,
  price: '$10.00',
  rawPrice: 10,
  soldIndividually: false,
  stockStatus: StockStatusEnum.IN_STOCK,
  stockQuantity: 10,
  manageStock: true,
} as unknown as Product;

export const mockedVariableProduct = {
  id: 'testProductId',
  databaseId: 1,
  slug: 'test-product',
  type: ProductTypesEnum.VARIABLE,
  rawPrice: '10,20',
  price: '$10 - $20',
  soldIndividually: false,
  name: 'Test Product',
  attributes: {
    nodes: [
      {
        id: '1',
        name: 'Color',
        label: 'Color',
        options: ['Red', 'Blue', 'Green'],
        variation: true,
        terms: null,
      },
    ],
  },
  variations: {
    nodes: [
      {
        id: '8',
        databaseId: 8,
        name: 'Test Product - Red',
        stockStatus: StockStatusEnum.IN_STOCK,
        stockQuantity: 10,
        manageStock: true,
        price: '$10',
        rawPrice: '10',
        attributes: {
          nodes: [
            {
              id: '1',
              name: 'Color',
              value: 'Red',
            },
          ],
        },
      },
      {
        id: '9',
        databaseId: 9,
        name: 'Test Product - Blue',
        stockStatus: StockStatusEnum.OUT_OF_STOCK,
        stockQuantity: 10,
        manageStock: true,
        price: '$20',
        rawPrice: '20',
        attributes: {
          nodes: [
            {
              id: '2',
              name: 'Color',
              value: 'Blue',
            },
          ],
        },
      },
    ],
  },
} as unknown as VariableProduct;

export const mockedProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    slug: 'product-1',
    shortDescription: 'This is product 1',
    image: {
      sourceUrl: 'http://example.com/product-1.jpg',
      altText: 'Product 1',
    },
    __typename: 'SimpleProduct',
    price: '$10',
  } as SimpleProduct,
  {
    id: '2',
    name: 'Product 2',
    slug: 'product-2',
    shortDescription: 'This is product 2',
    image: {
      sourceUrl: 'http://example.com/product-2.jpg',
      altText: 'Product 2',
    },
    __typename: 'SimpleProduct',
    price: '$20',
  } as SimpleProduct,
];
