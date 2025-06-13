import { useState, useEffect, useCallback } from 'react';
import { TodoItem, TodoFilter, TodoStats } from '../types/todo';

const STORAGE_KEY = 'todos-list';

export const useTodos = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<TodoFilter>({
    status: 'all',
    searchText: '',
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  // Load todos from localStorage on initial render
  useEffect(() => {
    const loadTodos = () => {
      try {
        const storedTodos = localStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error('Error loading todos from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTodos();
  }, []);

  // Save todos to localStorage with debounce
  useEffect(() => {
    if (loading) return;
    
    const saveTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }, 300); // 300ms debounce
    
    return () => clearTimeout(saveTimeout);
  }, [todos, loading]);

  // Add a new todo
  const addTodo = useCallback((text: string) => {
    if (text.trim()) {
      const now = new Date();
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now
      };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    }
  }, []);

  // Add multiple todos at once (batch add)
  const addTodos = useCallback((texts: string[]) => {
    const now = new Date();
    const newTodos = texts
      .filter(text => text.trim())
      .map(text => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: text.trim(),
        completed: false,
        createdAt: now,
        updatedAt: now
      }));
    
    if (newTodos.length > 0) {
      setTodos(prevTodos => [...prevTodos, ...newTodos]);
    }
  }, []);

  // Toggle todo completion status
  const toggleTodo = useCallback((id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id 
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() } 
          : todo
      )
    );
  }, []);

  // Toggle multiple todos at once
  const toggleTodos = useCallback((ids: string[]) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        ids.includes(todo.id)
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  // Delete a todo
  const deleteTodo = useCallback((id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }, []);

  // Delete multiple todos at once
  const deleteTodos = useCallback((ids: string[]) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !ids.includes(todo.id)));
  }, []);

  // Edit a todo's text
  const editTodo = useCallback((id: string, newText: string) => {
    if (newText.trim()) {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id 
            ? { ...todo, text: newText.trim(), updatedAt: new Date() } 
            : todo
        )
      );
    }
  }, []);

  // Clear all completed todos
  const clearCompleted = useCallback(() => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  }, []);

  // Set filter for todos
  const setFilterStatus = useCallback((status: TodoFilter['status']) => {
    setFilter(prev => ({ ...prev, status }));
  }, []);

  // Set search text
  const setSearchText = useCallback((searchText: string) => {
    setFilter(prev => ({ ...prev, searchText }));
  }, []);

  // Set sort options
  const setSortOptions = useCallback((sortBy: 'createdAt' | 'updatedAt' | 'text', sortDirection: 'asc' | 'desc') => {
    setFilter(prev => ({ ...prev, sortBy, sortDirection }));
  }, []);

  // Set priority for a todo
  const setPriority = useCallback((id: string, priority: TodoItem['priority']) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id
          ? { ...todo, priority, updatedAt: new Date() }
          : todo
      )
    );
  }, []);

  // Get filtered and sorted todos
  const getFilteredAndSortedTodos = useCallback((): TodoItem[] => {
    // Filter todos
    const filteredTodos = todos.filter(todo => {
      // Filter by status
      if (filter.status === 'active' && todo.completed) return false;
      if (filter.status === 'completed' && !todo.completed) return false;
      
      // Filter by search text
      if (filter.searchText && !todo.text.toLowerCase().includes(filter.searchText.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Sort todos
    return [...filteredTodos].sort((a, b) => {
      if (filter.sortBy === 'text') {
        return filter.sortDirection === 'asc' 
          ? a.text.localeCompare(b.text)
          : b.text.localeCompare(a.text);
      }
      
      const aValue = a[filter.sortBy];
      const bValue = b[filter.sortBy];
      
      if (!aValue || !bValue) return 0;
      
      if (filter.sortDirection === 'asc') {
        return new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      }
    });
  }, [todos, filter]);

  // Get todo statistics
  const getStats = useCallback((): TodoStats => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const hasCompletedTodos = completed > 0;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { 
      total, 
      completed, 
      active, 
      hasCompletedTodos,
      completionPercentage
    };
  }, [todos]);

  return {
    todos: getFilteredAndSortedTodos(),
    allTodos: todos,
    loading,
    filter,
    stats: getStats(),
    addTodo,
    addTodos,
    toggleTodo,
    toggleTodos,
    deleteTodo,
    deleteTodos,
    editTodo,
    setPriority,
    clearCompleted,
    setFilterStatus,
    setSearchText,
    setSortOptions
  };
}; 