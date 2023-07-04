import React from 'react';
import '@testing-library/react/dont-cleanup-after-each';

import { render, cleanup, screen } from '@woographql/testing';
import { Image } from '.';

describe('Image component', () => {
  afterAll(() => cleanup());
  const props = {
    src: 'https://example.com/image.jpg',
    alt: 'Example Image',
    width: 500,
    height: 500,
    ratio: 1,
  };

  const { baseElement } = render(<Image {...props} />);
  it('renders correctly', () => {

    // Check that the image is rendered
    const img = screen.getByRole('img', { name: props.alt });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', props.src);
    expect(img).toHaveAttribute('width', props.width.toString());
    expect(img).toHaveAttribute('height', props.height.toString());

    // Check that the loading spinner is rendered
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    expect(baseElement).toMatchSnapshot();
  });
});