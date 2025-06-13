import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Globe, ArrowLeft, Loader, Lightbulb } from 'lucide-react';
import { mobileAppsApi } from '../services/apiService';
import { CreateFromPromptRequest, ProjectType } from '../types/api';

export const MobileAppFromPromptPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateFromPromptRequest>({
    prompt: '',
    nombre: '',
    project_type: ProjectType.FLUTTER,
  });

  // Ejemplos de prompts sugeridos
  const ejemplosPrompts = [
    "crea una app móvil de gestión contable",
    "crea una app de delivery de comida",
    "crea una app de citas médicas",
    "crea una app escolar para estudiantes",
    "crea una app de gimnasio y fitness",
    "crea una app de red social para mascotas"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      setError('La descripción de la aplicación es requerida');
      return;
    }

    if (formData.prompt.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Paso 1: Crear la app desde prompt
      console.log('🔄 Paso 1: Creando app desde prompt...');
      const app = await mobileAppsApi.createFromPrompt(formData);
      console.log('✅ App creada:', app);
      
      // Paso 2: Generar automáticamente el proyecto y descargarlo
      console.log('🔄 Paso 2: Generando proyecto automáticamente...');
      const blob = await mobileAppsApi.generateProject(app.id);
      
      // Paso 3: Descargar el ZIP generado
      console.log('✅ Descargando proyecto...');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.nombre || 'mobile-app'}-${app.project_type}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(true);
      
      // Redirigir después de 3 segundos para mostrar el éxito
      setTimeout(() => {
        navigate('/', { 
          state: { 
            message: `¡App "${app.nombre}" creada y descargada exitosamente! El sistema agregó funcionalidades automáticamente.`,
            appId: app.id
          }
        });
      }, 3000);
      
    } catch (error: any) {
      console.error('Error in mobile app creation flow:', error);
      setError(
        error.response?.status === 400 
          ? 'Verifica que la descripción sea válida'
          : error.response?.status === 500
          ? 'Error interno del servidor. Intenta más tarde.'
          : 'Error creando la aplicación. Intenta con una descripción más específica.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleExampleClick = (ejemplo: string) => {
    setFormData({ ...formData, prompt: ejemplo });
  };



  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">¡Aplicación creada y descargada!</h2>
          <p className="text-gray-600 mb-4">El sistema agregó funcionalidades automáticamente y generó el proyecto completo.</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center gap-4">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Crear App con IA</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🤖 Crear aplicación con IA</h2>
            <p className="text-gray-600">
              Describe qué tipo de aplicación quieres crear. El sistema agregará funcionalidades automáticamente.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Ejemplos de prompts */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium text-gray-800">Ejemplos de descripciones:</h3>
            </div>
            <div className="grid gap-2">
              {ejemplosPrompts.map((ejemplo, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(ejemplo)}
                  className="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm text-gray-700 transition-colors"
                >
                  "{ejemplo}"
                </button>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de tu aplicación *
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Ejemplo: crea una app móvil de gestión contable con login, formularios de transacciones y reportes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 10 caracteres. Describe qué quieres que haga tu aplicación.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la aplicación
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Mi App Contable (opcional - se genera automáticamente)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional. Si no lo proporcionas, se generará automáticamente.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de proyecto
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, project_type: ProjectType.FLUTTER })}
                  className={`p-3 border rounded-md flex items-center gap-3 transition-colors ${
                    formData.project_type === ProjectType.FLUTTER
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Flutter</div>
                    <div className="text-xs text-gray-500">Aplicación móvil</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, project_type: ProjectType.ANGULAR })}
                  className={`p-3 border rounded-md flex items-center gap-3 transition-colors ${
                    formData.project_type === ProjectType.ANGULAR
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Globe className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">Angular</div>
                    <div className="text-xs text-gray-500">Aplicación web</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.prompt.trim()}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creando y generando app...
                  </>
                ) : (
                  <>
                    🤖 Crear y Descargar App
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleGoBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}; 