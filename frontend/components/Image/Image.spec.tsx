import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';

import { render, cleanup } from '@woographql/testing';
import { Image } from '.';

describe('Image component', () => {
  afterAll(() => cleanup());

  const { baseElement } = render(
    <Image src="/logo.png" alt="logo" />,
  );

  it('should render mount successfully', () => {
    expect(baseElement).toMatchSnapshot();
  });
});