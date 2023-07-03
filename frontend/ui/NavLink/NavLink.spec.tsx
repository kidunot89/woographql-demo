// NavLink.test.tsx
import { render, screen } from '@woographql/testing';
import { NavLink } from '.';

describe('NavLink component', () => {
  it('renders correctly', () => {
    const testText = 'Test Link';
    const testHref = '/test';

    render(<NavLink href={testHref}>{testText}</NavLink>);

    // Check that the link is rendered with the correct text and href
    const link = screen.getByRole('link', { name: testText });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', testHref);
  });

  it('renders correctly with additional className', () => {
    const testText = 'Test Link';
    const testHref = '/test';
    const testClassName = 'test-class';

    render(<NavLink href={testHref} className={testClassName}>{testText}</NavLink>);

    // Check that the link is rendered with the correct text, href, and class
    const link = screen.getByRole('link', { name: testText });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', testHref);
    expect(link).toHaveClass(testClassName);
  });

  it('should match snapshot', () => {
    const { baseElement } = render(<NavLink href="/test">Test Link</NavLink>);
    expect(baseElement).toMatchSnapshot();
  });
});
