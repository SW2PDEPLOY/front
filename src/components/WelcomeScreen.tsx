import React, { useState, useEffect } from 'react';
import { FolderPlus, File, Upload, Clock, Plus, ListTodo, Layers, Bot, Smartphone } from 'lucide-react';
import { authApi, diagramasApi, mockupsApi } from '../services/apiService';
import { Diagrama, Mockup, User } from '../types/api';
import { UserProfile } from './UserProfile';
import { useNavigate } from 'react-router-dom';

interface WelcomeScreenProps {
  onCreateNew: () => void;
  onCreateNewMockup: () => void;
  onOpenExisting: () => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;
  onShowTodoApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  // onCreateNew,
  // onCreateNewMockup,
  // onOpenExisting,
  onFileImport,
  // onLogout,
  // onShowTodoApp
}) => {
  const navigate = useNavigate();
  const [recentDiagrams, setRecentDiagrams] = useState<Diagrama[]>([]);
  const [recentMockups, setRecentMockups] = useState<Mockup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'diagrams' | 'mockups'>('diagrams');

  // Estos métodos ahora usan navigate en lugar de window.location
  const handleCreateNew = () => navigate('/new-diagram');
  const handleCreateNewMockup = () => navigate('/new-mockup');
  const handleOpenExisting = () => navigate('/diagrams-list');
  const handleShowTodoApp = () => navigate('/todos');
  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  // Función para abrir un diagrama específico
  const handleOpenDiagram = (diagramId: string) => {
    navigate(`/edit/diagram/${diagramId}`);
  };

  // Función para abrir un mockup específico
  const handleOpenMockup = (mockupId: string) => {
    navigate(`/edit/mockup/${mockupId}`);
  };

  // Función para navegar a crear app con IA
  const handleCreateAppWithAI = () => {
    navigate('/mobile-app-from-prompt');
  };

  // Función para gestionar apps móviles existentes
  const handleManageMobileApps = () => {
    navigate('/mobile-apps');
  };

  // Función para crear app desde imagen
  const handleCreateAppFromImage = () => {
    navigate('/mobile-app-from-image');
  };

  useEffect(() => {
    // Get current user
    try {
      const currentUser = authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }

    // Load diagrams from API only if authenticated
    const loadData = async () => {
      setLoading(true);
      try {
        if (!authApi.isAuthenticated()) {
          return;
        }
        
        try {
          // Load diagrams
          const diagrams = await diagramasApi.getAll();
          setRecentDiagrams(diagrams.slice(0, 10)); // Show only the 10 most recent
        } catch (error: any) {
          console.error('Error loading diagrams:', error);
          if (error.response?.status === 401) {
            // Invalid token, logout
            authApi.logout();
            navigate('/login');
          }
        }

        try {
          // Load mockups
          const mockups = await mockupsApi.getAll();
          setRecentMockups(mockups.slice(0, 10)); // Show only the 10 most recent
        } catch (error: any) {
          console.error('Error loading mockups:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user name for display
  const userName = user?.nombre || "Invitado";

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with user profile */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Diagram Maker</h1>
        <UserProfile onLogout={handleLogout} />
      </header>

      <main className="flex-grow flex flex-col p-6 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido, {userName}!</h2>
          <p className="text-gray-600">
            Comienza a diseñar tus diagramas y mockups ahora mismo
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleCreateNew}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Nuevo diagrama</h3>
              <p className="text-sm text-gray-500">Crear un nuevo diagrama en blanco</p>
            </div>
          </button>

          <button
            onClick={handleCreateNewMockup}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Layers size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Nuevo mockup</h3>
              <p className="text-sm text-gray-500">Crear un nuevo mockup en blanco</p>
            </div>
          </button>

          <button
            onClick={handleOpenExisting}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FolderPlus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Ver diagramas y mockups</h3>
              <p className="text-sm text-gray-500">Lista de todos tus diagramas y mockups</p>
            </div>
          </button>

          <button
            onClick={handleShowTodoApp}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <ListTodo size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Todo App</h3>
              <p className="text-sm text-gray-500">Gestiona tus tareas pendientes</p>
            </div>
          </button>

          <label className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Upload size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Importar archivo</h3>
              <p className="text-sm text-gray-500">Subir un archivo de diagrama</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xml,.drawio,.drawio.xml"
              onChange={onFileImport}
            />
          </label>

          <button
            onClick={handleCreateAppWithAI}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Bot size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">App con IA</h3>
              <p className="text-sm text-gray-500">Crear desde descripción de texto</p>
            </div>
          </button>

          <button
            onClick={handleManageMobileApps}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Smartphone size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Gestionar Apps</h3>
              <p className="text-sm text-gray-500">Ver y administrar apps creadas</p>
            </div>
          </button>

          <button
            onClick={handleCreateAppFromImage}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
              <Upload size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">App desde Imagen</h3>
              <p className="text-sm text-gray-500">Generar app desde mockup o diseño</p>
            </div>
          </button>
        </div>

        {/* Recent items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'diagrams'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('diagrams')}
            >
              Diagramas recientes
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'mockups'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('mockups')}
            >
              Mockups recientes
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-10">
                <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-500">Cargando...</p>
              </div>
            ) : activeTab === 'diagrams' ? (
              <>
                {recentDiagrams.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {recentDiagrams.map((diagram) => (
                      <li 
                        key={diagram.id} 
                        className="py-3 flex justify-between items-center hover:bg-gray-50 px-4 rounded cursor-pointer"
                        onClick={() => handleOpenDiagram(diagram.id)}
                      >
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-indigo-500 mr-3" />
                          <span className="text-gray-800">{diagram.nombre}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatDate(diagram.updatedAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <File className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No hay diagramas recientes</p>
                    <button
                      onClick={handleCreateNew}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Crear nuevo diagrama
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {recentMockups.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {recentMockups.map((mockup) => (
                      <li 
                        key={mockup.id} 
                        className="py-3 flex justify-between items-center hover:bg-gray-50 px-4 rounded cursor-pointer"
                        onClick={() => handleOpenMockup(mockup.id)}
                      >
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-green-500 mr-3" />
                          <span className="text-gray-800">{mockup.nombre}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatDate(mockup.updatedAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10">
                    <File className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No hay mockups recientes</p>
                    <button
                      onClick={handleCreateNewMockup}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Crear nuevo mockup
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
