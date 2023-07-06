/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-props-no-spreading */
// jest.setup.ts
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';

const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;
class LocalStorageMock {
  store: { [key:string|number]: unknown };

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: unknown) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  key(n: number) {
    return this.store[n];
  }
}

//global.localStorage = new LocalStorageMock() as unknown as Storage;

const getNodeText = (node: React.ReactNode[]|React.ReactNode): React.ReactNode|string|undefined => {
  if (['string', 'number'].includes(typeof node)) {
    return node;
  }
  if (node instanceof Array) {
    return node.map(getNodeText).join('');
  }
  if (typeof node === 'object' && node) {
    const n = node as React.ReactElement;
    return getNodeText(n?.props.children);
  }

  return undefined;
};

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line jsx-a11y/alt-text
  default: ({ fill, priority, ...props }: { [key:string]: unknown}) => <img {...props} />
  ,
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
}

global.ResizeObserver = ResizeObserver as any;