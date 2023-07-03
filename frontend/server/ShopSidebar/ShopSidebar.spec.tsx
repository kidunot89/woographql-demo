import { render, screen, fireEvent } from '@woographql/testing';
import { ShopSidebar } from '.';

describe('ShopSidebar component', () => {
  it('renders correctly', () => {
    render(<ShopSidebar>Test Content</ShopSidebar>);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('opens and closes the sidebar', () => {
    render(<ShopSidebar>Test Content</ShopSidebar>);

    const openButton = screen.getByLabelText('Open sidebar');
    fireEvent.click(openButton);

    expect(screen.getByText('Close', { selector: 'button' })).toBeInTheDocument();

    const closeButton = screen.getByLabelText('close sidebar');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });
});
