import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Globe, Download, Trash2, Plus, Search, Clock, Bot } from 'lucide-react';
import { mobileAppsApi } from '../services/apiService';
import { MobileApp, ProjectType } from '../types/api';

export const MobileAppsPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileApps, setMobileApps] = useState<MobileApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMobileApps();
  }, []);

  const loadMobileApps = async () => {
    try {
      setLoading(true);
      const apps = await mobileAppsApi.getAll();
      setMobileApps(apps);
    } catch (error) {
      console.error('Error loading mobile apps:', error);
      setError('Error cargando aplicaciones móviles');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (app: MobileApp) => {
    try {
      setGeneratingId(app.id);
      const blob = await mobileAppsApi.generateProject(app.id);
      
      // Download the generated project
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.nombre}-${app.project_type}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating project:', error);
      setError(`Error generando proyecto ${app.project_type}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la app "${nombre}"?`)) {
      return;
    }

    try {
      await mobileAppsApi.delete(id);
      await loadMobileApps();
    } catch (error) {
      console.error('Error deleting mobile app:', error);
      setError('Error eliminando aplicación móvil');
    }
  };

  const getProjectIcon = (type: ProjectType) => {
    return type === ProjectType.FLUTTER ? (
      <Smartphone className="w-5 h-5 text-blue-500" />
    ) : (
      <Globe className="w-5 h-5 text-red-500" />
    );
  };

  const getProjectColor = (type: ProjectType) => {
    return type === ProjectType.FLUTTER ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200';
  };

  const getCreationMethod = (app: MobileApp) => {
    // Si tiene prompt pero no XML, fue creada con IA
    if (app.prompt && !app.xml && !app.mockup_id) {
      return { icon: <Bot className="w-4 h-4 text-orange-500" />, text: "IA", color: "text-orange-600" };
    }
    // Si tiene XML, fue creada desde diagrama
    if (app.xml) {
      return { icon: <Globe className="w-4 h-4 text-blue-500" />, text: "XML", color: "text-blue-600" };
    }
    // Si tiene mockup_id, fue creada desde mockup
    if (app.mockup_id) {
      return { icon: <Smartphone className="w-4 h-4 text-green-500" />, text: "Mockup", color: "text-green-600" };
    }
    // Por defecto
    return { icon: <Plus className="w-4 h-4 text-gray-500" />, text: "Manual", color: "text-gray-600" };
  };

  const filteredApps = mobileApps.filter(app =>
    app.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.prompt && app.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Gestión de Aplicaciones Móviles</h1>
        <div className="flex-1"></div>
        <button
          onClick={() => navigate('/mobile-app-from-prompt')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <Bot size={16} />
          Crear con IA
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Smartphone className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Apps</p>
                <p className="text-lg font-semibold text-gray-900">{mobileApps.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Creadas con IA</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mobileApps.filter(app => app.prompt && !app.xml && !app.mockup_id).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Smartphone className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Flutter</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mobileApps.filter(app => app.project_type === ProjectType.FLUTTER).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Angular</p>
                <p className="text-lg font-semibold text-gray-900">
                  {mobileApps.filter(app => app.project_type === ProjectType.ANGULAR).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Apps List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando aplicaciones...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchTerm ? 
                `No se encontraron apps que coincidan con "${searchTerm}"` :
                'No hay aplicaciones móviles creadas'
              }
            </p>
            <button
              onClick={() => navigate('/mobile-app-from-prompt')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 mx-auto"
            >
              <Bot size={16} />
              Crear primera app con IA
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => {
              const creationMethod = getCreationMethod(app);
              return (
                <div
                  key={app.id}
                  className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${getProjectColor(app.project_type)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getProjectIcon(app.project_type)}
                      <h3 className="font-semibold text-gray-900 truncate">{app.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white px-2 py-1 rounded-full border">
                        {app.project_type.toUpperCase()}
                      </span>
                      <div className={`flex items-center gap-1 ${creationMethod.color}`} title={`Creada desde ${creationMethod.text}`}>
                        {creationMethod.icon}
                        <span className="text-xs">{creationMethod.text}</span>
                      </div>
                    </div>
                  </div>

                  {app.prompt && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {app.prompt}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Creado: {formatDate(app.createdAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerate(app)}
                      disabled={generatingId === app.id}
                      className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {generatingId === app.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          Descargar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(app.id, app.nombre)}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}; 