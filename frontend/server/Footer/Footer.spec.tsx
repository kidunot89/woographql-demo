import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';

import { render, cleanup } from '@woographql/testing';
import { Footer } from '.';

describe('DocsNav component', () => {
  afterAll(() => cleanup());

  process.env.SITE_NAME = 'Shop Demo';
  const { baseElement } = render(
    <Footer />,
  );

  it('should render mount successfully', () => {
    expect(baseElement).toMatchSnapshot();
  });
});
