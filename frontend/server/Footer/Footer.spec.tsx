import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';

import { render, cleanup } from '@axis/testing';
import { Footer } from '.';

describe('DocsNav component', () => {
  afterAll(() => cleanup());

  process.env.GITHUB_URL = 'http://google.com';
  process.env.TWITTER_URL = 'http://google.com';
  process.env.SLACK_URL = 'http://google.com';
  const { baseElement } = render(
    <Footer />,
  );

  it('should render mount successfully', () => {
    expect(baseElement).toMatchSnapshot();
  });
});
