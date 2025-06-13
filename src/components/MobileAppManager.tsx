import React, { useState, useEffect } from 'react';
import { Smartphone, Globe, Download, Trash2, Plus } from 'lucide-react';
import { MobileApp, ProjectType, CreateMobileAppRequest } from '../types/api';
import { mobileAppsApi } from '../services/apiService';

interface MobileAppManagerProps {
  onClose: () => void;
}

export const MobileAppManager: React.FC<MobileAppManagerProps> = ({ onClose }) => {
  const [mobileApps, setMobileApps] = useState<MobileApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateMobileAppRequest>({
    nombre: '',
    prompt: '',
    project_type: ProjectType.FLUTTER,
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.prompt) {
      setError('Nombre y descripción son requeridos');
      return;
    }

    try {
      setLoading(true);
      await mobileAppsApi.create(formData);
      setShowCreateForm(false);
      setFormData({
        nombre: '',
        prompt: '',
        project_type: ProjectType.FLUTTER,
      });
      await loadMobileApps();
    } catch (error) {
      console.error('Error creating mobile app:', error);
      setError('Error creando aplicación móvil');
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta aplicación?')) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestión de Aplicaciones Móviles</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-md flex items-center gap-2"
            >
              <Plus size={16} />
              Nueva App
            </button>
            <button
              onClick={onClose}
              className="bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-gray-50 border rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Crear Nueva Aplicación</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la aplicación
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mi App Increíble"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción de la aplicación
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Describe qué quieres que haga tu aplicación..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de proyecto
                  </label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={ProjectType.FLUTTER}>Flutter (Móvil)</option>
                    <option value={ProjectType.ANGULAR}>Angular (Web)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Creando...' : 'Crear Aplicación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Apps List */}
          {loading && !showCreateForm ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando aplicaciones...</p>
            </div>
          ) : mobileApps.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay aplicaciones móviles creadas</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-800"
              >
                Crear la primera aplicación
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mobileApps.map((app) => (
                <div
                  key={app.id}
                  className={`border rounded-lg p-4 ${getProjectColor(app.project_type)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getProjectIcon(app.project_type)}
                      <h3 className="font-semibold text-gray-900">{app.nombre}</h3>
                    </div>
                    <span className="text-xs bg-white px-2 py-1 rounded-full">
                      {app.project_type.toUpperCase()}
                    </span>
                  </div>

                  {app.prompt && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {app.prompt}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    Creado: {new Date(app.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerate(app)}
                      disabled={generatingId === app.id}
                      className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generatingId === app.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download size={16} />
                          Generar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 