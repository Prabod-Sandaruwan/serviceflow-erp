import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the initial dashboard route', async () => {
    render(<App />);
    const heading = await screen.findByText(/Dashboard Page/i);
    expect(heading).toBeInTheDocument();
  });
});
