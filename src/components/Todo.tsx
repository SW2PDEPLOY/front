import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Edit2, X, Flag, AlertTriangle, AlertCircle } from 'lucide-react';
import { TodoItem as TodoItemType } from '../types/todo';

interface TodoItemProps {
    id: string;
    text: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (id: string) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, newText: string) => void;
    onSetPriority?: (id: string, priority: 'low' | 'medium' | 'high' | undefined) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
    id,
    text,
    completed,
    priority,
    selectable = false,
    selected = false,
    onSelect,
    onToggle,
    onDelete,
    onEdit,
    onSetPriority,
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editText, setEditText] = useState<string>(text);
    const [showPriorityMenu, setShowPriorityMenu] = useState<boolean>(false);
    const priorityMenuRef = useRef<HTMLDivElement>(null);
    const priorityButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                priorityMenuRef.current &&
                priorityButtonRef.current &&
                !priorityMenuRef.current.contains(event.target as Node) &&
                !priorityButtonRef.current.contains(event.target as Node)
            ) {
                setShowPriorityMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setEditText(text);
    };

    const handleSave = () => {
        if (editText.trim()) {
            onEdit(id, editText);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditText(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const handlePriorityToggle = () => {
        setShowPriorityMenu(!showPriorityMenu);
    };

    const handleSetPriority = (newPriority: 'low' | 'medium' | 'high' | undefined) => {
        if (onSetPriority) {
            onSetPriority(id, newPriority);
        }
        setShowPriorityMenu(false);
    };

    const getPriorityColor = () => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-400';
        }
    };

    const getPriorityIcon = () => {
        switch (priority) {
            case 'high': return <AlertCircle size={14} className="text-red-500" />;
            case 'medium': return <AlertTriangle size={14} className="text-yellow-500" />;
            case 'low': return <Flag size={14} className="text-blue-500" />;
            default: return <Flag size={14} className="text-gray-400" />;
        }
    };

    return (
        <li className={`py-3 px-4 border-b border-gray-200 last:border-0 group hover:bg-gray-50 transition-colors ${selected ? 'bg-indigo-50' : ''}`}>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                        title="Save"
                    >
                        <Check size={18} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        title="Cancel"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {selectable ? (
                            <div
                                onClick={() => onSelect?.(id)}
                                className={`w-5 h-5 rounded border ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'} flex items-center justify-center cursor-pointer`}
                            >
                                {selected && <Check size={12} className="text-white" />}
                            </div>
                        ) : (
                            <input
                                type="checkbox"
                                checked={completed}
                                onChange={() => onToggle(id)}
                                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                        )}
                        <div className="flex flex-col">
                            <span className={`text-gray-800 ${completed ? 'line-through text-gray-500' : ''}`}>
                                {text}
                            </span>
                            {priority && (
                                <span className={`text-xs ${getPriorityColor()} flex items-center gap-1`}>
                                    {getPriorityIcon()}
                                    {priority} priority
                                </span>
                            )}
                        </div>
                    </div>
                    <div className={`flex gap-2 ${selectable ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        {!selectable && onSetPriority && (
                            <div className="relative">
                                <button
                                    ref={priorityButtonRef}
                                    onClick={handlePriorityToggle}
                                    className={`p-1 rounded-full hover:bg-gray-100 ${getPriorityColor()}`}
                                    title="Set priority"
                                >
                                    {getPriorityIcon()}
                                </button>
                                {showPriorityMenu && (
                                    <div
                                        ref={priorityMenuRef}
                                        className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32 py-1"
                                    >
                                        <button
                                            onClick={() => handleSetPriority('high')}
                                            className="flex items-center w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                                        >
                                            <AlertCircle size={14} className="text-red-500 mr-2" />
                                            High
                                        </button>
                                        <button
                                            onClick={() => handleSetPriority('medium')}
                                            className="flex items-center w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                                        >
                                            <AlertTriangle size={14} className="text-yellow-500 mr-2" />
                                            Medium
                                        </button>
                                        <button
                                            onClick={() => handleSetPriority('low')}
                                            className="flex items-center w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                                        >
                                            <Flag size={14} className="text-blue-500 mr-2" />
                                            Low
                                        </button>
                                        {priority && (
                                            <button
                                                onClick={() => handleSetPriority(undefined)}
                                                className="flex items-center w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                                            >
                                                <X size={14} className="text-gray-500 mr-2" />
                                                None
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {!selectable && (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete(id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
};

interface TodoProps {
    items: Array<TodoItemType>;
    selectable?: boolean;
    selectedIds?: string[];
    onSelect?: (id: string) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, newText: string) => void;
    onSetPriority?: (id: string, priority: 'low' | 'medium' | 'high' | undefined) => void;
}

export const Todo: React.FC<TodoProps> = ({
    items,
    selectable = false,
    selectedIds = [],
    onSelect,
    onToggle,
    onDelete,
    onEdit,
    onSetPriority
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h2 className="px-6 py-4 text-lg font-medium text-gray-800 border-b border-gray-200 flex justify-between items-center">
                <span>Todo List</span>
                <span className="text-sm font-normal text-gray-500">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </h2>
            {items.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No tasks yet. Add a new task to get started.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <TodoItem
                            key={item.id}
                            id={item.id}
                            text={item.text}
                            completed={item.completed}
                            priority={item.priority}
                            selectable={selectable}
                            selected={selectedIds.includes(item.id)}
                            onSelect={onSelect}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onSetPriority={onSetPriority}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}; 