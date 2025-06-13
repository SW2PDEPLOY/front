import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { File, Edit2, Trash2, AlertCircle, Search, Clock } from 'lucide-react';

// Servicios API
import { authApi, diagramasApi, mockupsApi } from '../services/apiService';

// Componentes
import { Todo } from '../components/Todo';
import { Diagrama, Mockup } from '../types/api';

// Interfaz para unificar diagramas y mockups
interface DiagramItemType {
  id: string;
  text: string;
  completed: boolean; // Usaremos esto para destacar elementos recientes
  priority?: 'low' | 'medium' | 'high';
  type: 'diagram' | 'mockup';
  createdAt: Date;
  updatedAt: Date; // Añadido para cumplir con el tipo TodoItem
}

// Tipos de ordenamiento
type SortType = 'newest' | 'oldest' | 'recently-updated' | 'name';

export const DiagramListPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<DiagramItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'diagrams' | 'mockups'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortType>('newest');

  // Cargar diagramas y mockups al montar el componente
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const [diagrams, mockups] = await Promise.all([
          diagramasApi.getAll().catch((err) => {
            console.error('Error cargando diagramas:', err);
            if (err.response?.status === 401) {
              authApi.logout();
              navigate('/login');
            }
            return [] as Diagrama[];
          }),
          mockupsApi.getAll().catch((err) => {
            console.error('Error cargando mockups:', err);
            return [] as Mockup[];
          }),
        ]);

        // Convertir diagramas al formato unificado
        const diagramItems: DiagramItemType[] = diagrams.map(diagram => ({
          id: diagram.id,
          text: diagram.nombre,
          completed: false,
          priority: 'medium', // Por defecto, prioridad media para diagramas
          type: 'diagram',
          createdAt: new Date(diagram.createdAt),
          updatedAt: new Date(diagram.updatedAt)
        }));

        // Convertir mockups al formato unificado
        const mockupItems: DiagramItemType[] = mockups.map(mockup => ({
          id: mockup.id,
          text: mockup.nombre,
          completed: false,
          priority: 'low', // Por defecto, prioridad baja para mockups
          type: 'mockup',
          createdAt: new Date(mockup.createdAt),
          updatedAt: new Date(mockup.updatedAt)
        }));

        // Ordenar por fecha de creación (más reciente primero)
        const allItems = [...diagramItems, ...mockupItems];
        sortItems(allItems, sortBy);

        setItems(allItems);
      } catch (error) {
        console.error('Error cargando elementos:', error);
        setError('Error al cargar los diagramas y mockups. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [navigate]);

  // Función para ordenar items
  const sortItems = (itemsToSort: DiagramItemType[], sortType: SortType) => {
    switch (sortType) {
      case 'newest':
        return itemsToSort.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return itemsToSort.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'recently-updated':
        return itemsToSort.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      case 'name':
        return itemsToSort.sort((a, b) => a.text.localeCompare(b.text));
      default:
        return itemsToSort;
    }
  };

  // Aplicar todos los filtros y ordenamiento
  const getFilteredItems = () => {
    // Filtrar por tipo
    let filtered = items.filter(item => {
      if (activeTab === 'all') return true;
      if (activeTab === 'diagrams') return item.type === 'diagram';
      return item.type === 'mockup';
    });

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.text.toLowerCase().includes(searchLower)
      );
    }

    // Retornar items ordenados
    return sortItems([...filtered], sortBy);
  };

  const filteredItems = getFilteredItems();

  // Manejar la edición (abrir el diagrama o mockup)
  const handleEdit = (id: string, _: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      navigate(`/edit/${item.type}/${id}`);
    }
  };

  // Manejar la eliminación
  const handleDelete = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) return;

    try {
      if (item.type === 'diagram') {
        await diagramasApi.delete(id);
      } else {
        await mockupsApi.delete(id);
      }

      // Actualizar la lista local
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error(`Error eliminando ${item.type}:`, error);
      setError(`Error al eliminar el ${item.type === 'diagram' ? 'diagrama' : 'mockup'}. Por favor, intenta de nuevo.`);
    }
  };

  // Manejar selección
  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Manejar toggle (no usado realmente, pero requerido por Todo)
  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Manejar cambio de pestaña
  const handleTabChange = (tab: 'all' | 'diagrams' | 'mockups') => {
    setActiveTab(tab);
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (newSort: SortType) => {
    setSortBy(newSort);
  };

  // Manejar la creación de nuevos elementos
  const handleCreateNew = (type: 'diagram' | 'mockup') => {
    navigate(type === 'diagram' ? '/new-diagram' : '/new-mockup');
  };

  // Manejar eliminación múltiple
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      // Promesas para eliminar todos los elementos seleccionados
      const deletePromises = selectedIds.map(id => {
        const item = items.find(item => item.id === id);
        if (!item) return Promise.resolve();
        
        return item.type === 'diagram' 
          ? diagramasApi.delete(id)
          : mockupsApi.delete(id);
      });

      await Promise.all(deletePromises);

      // Actualizar la lista local
      setItems(items.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error eliminando elementos:', error);
      setError('Error al eliminar los elementos seleccionados. Por favor, intenta de nuevo.');
    }
  };

  // Manejar click directo en un elemento (navegar a edición)
  const handleItemClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      navigate(`/edit/${item.type}/${id}`);
    }
  };

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mis Diagramas y Mockups</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCreateNew('diagram')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Nuevo Diagrama
            </button>
            <button
              onClick={() => handleCreateNew('mockup')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Nuevo Mockup
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Filtros y ordenamiento */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Pestañas para filtrar */}
          <div className="flex border-b border-gray-200 flex-grow">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('all')}
            >
              Todos
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'diagrams'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('diagrams')}
            >
              Diagramas
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'mockups'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('mockups')}
            >
              Mockups
            </button>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center">
            <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mr-2">
              Ordenar por:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortType)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="newest">Creados más recientes</option>
              <option value="oldest">Creados más antiguos</option>
              <option value="recently-updated">Recién actualizados</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Acciones en lote */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-md mb-6 flex justify-between items-center">
            <span className="text-indigo-700">
              {selectedIds.length} {selectedIds.length === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar seleccionados
            </button>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {loading ? (
          <div className="text-center py-10">
            <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">Cargando diagramas y mockups...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {searchTerm ? 
                `No se encontraron resultados para "${searchTerm}"` :
                activeTab === 'all' 
                  ? 'No hay diagramas ni mockups disponibles.' 
                  : activeTab === 'diagrams' 
                    ? 'No hay diagramas disponibles.' 
                    : 'No hay mockups disponibles.'
              }
            </p>
            <button
              onClick={() => handleCreateNew(activeTab === 'mockups' ? 'mockup' : 'diagram')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {activeTab === 'mockups' 
                ? 'Crear nuevo mockup' 
                : 'Crear nuevo diagrama'}
            </button>
          </div>
        ) : (
          <>
            <Todo
              items={filteredItems}
              selectable={true}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSetPriority={(id) => handleItemClick(id)} // Usar el evento onSetPriority para navegar al editar
            />
            
            {/* Lista con fechas y navegación al hacer clic */}
            <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actualizado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            item.type === 'diagram' ? 'bg-indigo-100' : 'bg-green-100'
                          }`}>
                            <File className={`h-5 w-5 ${
                              item.type === 'diagram' ? 'text-indigo-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.text}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === 'diagram' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.type === 'diagram' ? 'Diagrama' : 'Mockup'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(item.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenir la navegación al hacer clic en el botón
                            handleItemClick(item.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevenir la navegación al hacer clic en el botón
                            handleDelete(item.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 