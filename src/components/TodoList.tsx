import React, { useState, useEffect } from 'react';
import { Todo } from './Todo';
import { useTodos } from '../hooks/useTodos';
import { Plus, CheckSquare, Loader, Search, X, ArrowUpDown, Trash2, Check } from 'lucide-react';
import { TodoFilter } from '../types/todo';

export const TodoList: React.FC = () => {
  const { 
    todos, 
    stats,
    loading, 
    filter,
    addTodo, 
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
  } = useTodos();
  
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState<boolean>(false);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' || 
         (activeElement as HTMLElement).isContentEditable);
      
      if (isInputActive) return;
      
      // Keyboard shortcuts
      switch (e.key.toLowerCase()) {
        case 'n':
          // Focus the new todo input
          document.getElementById('new-todo-input')?.focus();
          e.preventDefault();
          break;
        case '/':
          // Focus the search input
          document.getElementById('search-input')?.focus();
          e.preventDefault();
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            // Toggle select all with Ctrl/Cmd+A
            if (showBatchActions) {
              toggleSelectAll();
              e.preventDefault();
            }
          } else {
            // Show/hide batch actions
            setShowBatchActions(prev => !prev);
            e.preventDefault();
          }
          break;
        case 'escape':
          // Cancel selection mode
          if (showBatchActions) {
            setShowBatchActions(false);
            setSelectedTodoIds([]);
            e.preventDefault();
          }
          break;
        case 'c':
          // Clear completed todos
          if (stats.hasCompletedTodos) {
            clearCompleted();
            e.preventDefault();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBatchActions, selectedTodoIds, stats.hasCompletedTodos, clearCompleted]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText);
      setNewTodoText('');
    }
  };

  const handleFilterChange = (status: TodoFilter['status']) => {
    setFilterStatus(status);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  const handleSortChange = (sortBy: TodoFilter['sortBy']) => {
    const newDirection = 
      filter.sortBy === sortBy && filter.sortDirection === 'desc' 
        ? 'asc' 
        : 'desc';
    
    setSortOptions(sortBy, newDirection);
  };
  
  const toggleSelectTodo = (id: string) => {
    setSelectedTodoIds(prev => 
      prev.includes(id) 
        ? prev.filter(todoId => todoId !== id)
        : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedTodoIds.length === todos.length) {
      setSelectedTodoIds([]);
    } else {
      setSelectedTodoIds(todos.map(todo => todo.id));
    }
  };
  
  const handleBatchToggle = () => {
    if (selectedTodoIds.length > 0) {
      toggleTodos(selectedTodoIds);
      setSelectedTodoIds([]);
      setShowBatchActions(false);
    }
  };
  
  const handleBatchDelete = () => {
    if (selectedTodoIds.length > 0) {
      deleteTodos(selectedTodoIds);
      setSelectedTodoIds([]);
      setShowBatchActions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader className="animate-spin text-indigo-600" size={32} />
        <span className="ml-2 text-gray-600">Loading todos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo App</h1>
      
      {/* Search bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          id="search-input"
          type="text"
          value={filter.searchText}
          onChange={handleSearchChange}
          placeholder="Search todos... (Press '/' to focus)"
          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {filter.searchText && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* Sort and filter controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        {/* Filter tabs */}
        <div className="flex border-b w-full sm:w-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 font-medium text-sm ${
              filter.status === 'all'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={`px-4 py-2 font-medium text-sm ${
              filter.status === 'active'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-4 py-2 font-medium text-sm ${
              filter.status === 'completed'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="flex gap-2 text-sm">
          <button 
            onClick={() => handleSortChange('createdAt')} 
            className={`flex items-center gap-1 px-3 py-1 rounded-md ${
              filter.sortBy === 'createdAt' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Date Added
            {filter.sortBy === 'createdAt' && (
              <ArrowUpDown size={14} className="ml-1" />
            )}
          </button>
          <button 
            onClick={() => handleSortChange('updatedAt')} 
            className={`flex items-center gap-1 px-3 py-1 rounded-md ${
              filter.sortBy === 'updatedAt' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Updated
            {filter.sortBy === 'updatedAt' && (
              <ArrowUpDown size={14} className="ml-1" />
            )}
          </button>
          <button 
            onClick={() => handleSortChange('text')} 
            className={`flex items-center gap-1 px-3 py-1 rounded-md ${
              filter.sortBy === 'text' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alphabetical
            {filter.sortBy === 'text' && (
              <ArrowUpDown size={14} className="ml-1" />
            )}
          </button>
        </div>
      </div>
      
      {/* Add new todo form */}
      <form 
        onSubmit={handleAddTodo} 
        className="flex mb-6 gap-2"
      >
        <input
          id="new-todo-input"
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new task... (Press 'n' to focus)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!newTodoText.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </form>
      
      {/* Keyboard shortcuts help */}
      <div className="mb-4 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs mr-1">n</kbd>
          New todo
        </span>
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs mr-1">/</kbd>
          Search
        </span>
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs mr-1">a</kbd>
          Select mode
        </span>
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs mr-1">c</kbd>
          Clear completed
        </span>
        <span className="flex items-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs mr-1">Esc</kbd>
          Cancel selection
        </span>
      </div>
      
      {/* Batch actions */}
      {todos.length > 0 && (
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => setShowBatchActions(!showBatchActions)}
            className={`text-sm px-3 py-1.5 rounded-md flex items-center gap-1 ${
              showBatchActions 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showBatchActions ? 'Cancel Selection' : 'Select Multiple'}
          </button>
          
          {showBatchActions && (
            <div className="flex gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-1"
              >
                {selectedTodoIds.length === todos.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedTodoIds.length > 0 && (
                <>
                  <button
                    onClick={handleBatchToggle}
                    className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center gap-1"
                  >
                    <Check size={14} />
                    Toggle {selectedTodoIds.length}
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete {selectedTodoIds.length}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Display todos */}
      <Todo
        items={todos}
        selectable={showBatchActions}
        selectedIds={selectedTodoIds}
        onSelect={toggleSelectTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
        onSetPriority={setPriority}
      />
      
      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="mt-4 mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${stats.completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{stats.completionPercentage}% completed</span>
            <span>{stats.completed}/{stats.total} tasks</span>
          </div>
        </div>
      )}
      
      {/* Footer with actions */}
      {stats.total > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>
            {stats.active} {stats.active === 1 ? 'task' : 'tasks'} left
          </span>
          {stats.hasCompletedTodos && (
            <button
              onClick={clearCompleted}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <CheckSquare size={16} className="mr-1" />
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 