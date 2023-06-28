import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';

import { render, cleanup } from '@woographql/testing';
import { LoadingSpinner } from '.';

describe('LoadingSpinner component', () => {
  afterAll(() => cleanup());

  const { baseElement } = render(
    <LoadingSpinner />,
  );

  it('should render mount successfully', () => {
    expect(baseElement).toMatchSnapshot();
  });
});