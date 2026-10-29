import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../../../src/features/auth/AuthProvider';
import { api } from '../../../src/lib/api';

vi.mock('../../../src/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  setOnUnauthenticated: vi.fn(),
  clearCsrfToken: vi.fn(),
}));

function Consumer() {
  const { user, status } = useAuth();
  if (status === 'loading') return <div>Loading...</div>;
  return <div>{user ? user.email : 'Guest'}</div>;
}

const renderWithProviders = (client: QueryClient) => {
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>,
  );
};

describe('AuthProvider component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user email when authenticated', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { id: '1', email: 'alice@serviceflow.lk', role: 'ADMIN' },
    });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderWithProviders(client);

    expect(await screen.findByText('alice@serviceflow.lk')).toBeInTheDocument();
  });

  it("renders 'Guest' when unauthenticated (401)", async () => {
    vi.mocked(api.get).mockRejectedValueOnce({ status: 401 });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderWithProviders(client);

    expect(await screen.findByText('Guest')).toBeInTheDocument();
  });
});
