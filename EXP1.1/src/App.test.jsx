import { render, screen } from '@testing-library/react';
import App from './App';

describe('Dynamic post composer', () => {
  it('renders the composer and validation panel', () => {
    render(<App />);

    expect(screen.getByText(/build once, publish everywhere/i)).toBeInTheDocument();
    expect(screen.getByText(/live validation/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(/use at most 2 hashtags/i)).toBeInTheDocument();
  });
});
