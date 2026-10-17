import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the ServiceFlow ERP Frontend Running header', () => {
    render(<App />);
    const headingElement = screen.getByText(/ServiceFlow ERP Frontend Running/i);
    expect(headingElement).toBeInTheDocument();
  });

  it('renders system online indicator', () => {
    render(<App />);
    const statusElement = screen.getByText(/System Online/i);
    expect(statusElement).toBeInTheDocument();
  });
});
