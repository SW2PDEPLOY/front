import React, { useState, useRef } from 'react';
import { 
  analyzeImageAndGenerateProject, 
  fileToBase64, 
  validateImageFile,
  getImageInfo,
  type ProjectGenerationResponse 
} from '../services/imageAnalysisService';

interface FormData {
  projectName: string;
  projectType: 'flutter' | 'angular';
  imageFile: File | null;
}

const MobileAppFromImagePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectType: 'flutter',
    imageFile: null
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<{ sizeKB: number; format: string } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo no válido');
      return;
    }

    setIsCompressing(true);
    setError('');

    try {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      // Crear preview comprimido
      const compressedBase64 = await fileToBase64(file, true);
      setImagePreview(compressedBase64);
      
      // Mostrar información de la imagen
      const info = getImageInfo(compressedBase64);
      setImageInfo(info);
      
      setSuccess(`Imagen cargada y comprimida: ${info.sizeKB} KB (${info.format.toUpperCase()})`);
      
    } catch (err) {
      setError('Error procesando imagen: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!formData.imageFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult('');

    try {
      const base64Image = await fileToBase64(formData.imageFile, true);
      
      // Usar el servicio de análisis de imágenes
      const { analyzeImageForProject } = await import('../services/imageAnalysisService');
      const result = await analyzeImageForProject(base64Image, formData.projectType);
      
      if (result.success && result.description) {
        setAnalysisResult(result.description);
        setSuccess('¡Imagen analizada correctamente! Revisa la descripción y genera el proyecto.');
      } else {
        setError(result.error || 'Error analizando imagen');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analizando imagen');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateProject = async () => {
    if (!formData.imageFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    if (!formData.projectName.trim()) {
      setError('Por favor ingresa un nombre para el proyecto');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const base64Image = await fileToBase64(formData.imageFile, true);
      
      const result: ProjectGenerationResponse = await analyzeImageAndGenerateProject(
        base64Image,
        formData.projectType,
        formData.projectName
      );

      if (result.success && result.downloadUrl) {
        // Descargar archivo automáticamente
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${formData.projectName}-${formData.projectType}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL del blob
        URL.revokeObjectURL(result.downloadUrl);
        
        setSuccess(`¡Proyecto ${formData.projectType} generado y descargado correctamente!`);
        
        // Limpiar formulario
        setFormData({
          projectName: '',
          projectType: 'flutter',
          imageFile: null
        });
        setImagePreview('');
        setImageInfo(null);
        setAnalysisResult('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } else {
        setError(result.error || 'Error generando proyecto');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando proyecto');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null
    }));
    setImagePreview('');
    setImageInfo(null);
    setAnalysisResult('');
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generar App desde Imagen
          </h1>
          <p className="text-lg text-gray-600">
            Sube una imagen de mockup o diseño y genera automáticamente una aplicación Flutter o Angular
          </p>
        </div>

        {/* Formulario Principal */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuración del Proyecto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Configuración del Proyecto</h3>
              
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="mi-app-increible"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Proyecto
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="flutter">Flutter</option>
                  <option value="angular">Angular</option>
                </select>
              </div>
            </div>

            {/* Subida de Imagen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Imagen del Diseño</h3>
              
              <div>
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Imagen
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isCompressing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos soportados: JPEG, PNG, GIF, WebP (máx. 20MB - se comprimirá automáticamente)
                </p>
              </div>

              {isCompressing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Comprimiendo imagen...</span>
                </div>
              )}

              {imageInfo && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  📊 Imagen procesada: {imageInfo.sizeKB} KB ({imageInfo.format.toUpperCase()})
                </div>
              )}

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-contain border border-gray-200 rounded-md"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={handleAnalyzeImage}
              disabled={!formData.imageFile || isAnalyzing || isCompressing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analizando...
                </>
              ) : (
                'Analizar Imagen'
              )}
            </button>

            <button
              onClick={handleGenerateProject}
              disabled={!formData.imageFile || !formData.projectName.trim() || isGenerating || isCompressing}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando Proyecto...
                </>
              ) : (
                `Generar Proyecto ${formData.projectType}`
              )}
            </button>
          </div>
        </div>

        {/* Mensajes de Estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultado del Análisis */}
        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de la Imagen</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {analysisResult}
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Si el análisis se ve correcto, puedes proceder a generar el proyecto.
            </p>
          </div>
        )}

        {/* Información Adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Consejos para mejores resultados:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Usa imágenes claras y de alta resolución</li>
            <li>• Asegúrate de que todos los elementos UI sean visibles</li>
            <li>• Incluye mockups de múltiples pantallas si es posible</li>
            <li>• Los textos en la imagen deben ser legibles</li>
            <li>• Las imágenes se comprimen automáticamente para optimizar el envío</li>
            <li>• Evita imágenes muy complejas o con muchos elementos superpuestos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileAppFromImagePage; 