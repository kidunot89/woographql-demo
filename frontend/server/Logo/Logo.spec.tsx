import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';
import { render, cleanup } from '@woographql/testing';

import { Logo } from '.';

describe('Logo component', () => {
  afterAll(() => cleanup());
  process.env.FRONTEND_URL = 'http://google.com';
  const { baseElement } = render(
    <Logo />,
  );

  it('should render successfully', () => {
    expect(baseElement).toMatchSnapshot();
  });
});