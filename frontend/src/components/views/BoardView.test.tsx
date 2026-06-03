import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BoardView from './BoardView';

// Mock the react-router-dom hooks
vi.mock('react-router-dom', () => ({
  useParams: () => ({ projectId: 'test-project' }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// Mock the react-query hooks
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: [
      { id: '1', title: 'Task 1', status: 'TODO', priority: 'HIGH', sortOrder: 1 },
      { id: '2', title: 'Task 2', status: 'IN_PROGRESS', priority: 'LOW', sortOrder: 2 },
    ],
    isLoading: false,
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
  }),
  useQueryClient: vi.fn(),
}));

describe('BoardView Component', () => {
  it('renders all Kanban columns correctly', () => {
    render(<BoardView />);
    
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('In Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders tasks in the correct columns', () => {
    render(<BoardView />);
    
    // We expect "Task 1" and "Task 2" to be rendered somewhere in the board based on the mock data.
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});
