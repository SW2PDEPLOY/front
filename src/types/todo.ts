export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface TodoFilter {
  status: 'all' | 'active' | 'completed';
  searchText: string;
  sortBy: 'createdAt' | 'updatedAt' | 'text';
  sortDirection: 'asc' | 'desc';
}

export interface TodoStats {
  total: number;
  active: number;
  completed: number;
  hasCompletedTodos: boolean;
  completionPercentage: number;
} 