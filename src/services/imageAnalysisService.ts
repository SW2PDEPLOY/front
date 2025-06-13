interface ImageAnalysisResponse {
  success: boolean;
  description?: string;
  error?: string;
}

interface ProjectGenerationRequest {
  description: string;
  projectType: 'flutter' | 'angular';
  nombre?: string;
}

interface ProjectGenerationResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

/**
 * Comprime una imagen para reducir su tamaño
 */
export const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo la proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      // Configurar canvas
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convertir a base64 con compresión
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Error cargando imagen para compresión'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Analiza una imagen y genera una descripción detallada para crear una aplicación móvil
 */
export const analyzeImageForProject = async (
  base64Image: string,
  projectType: 'flutter' | 'angular' = 'flutter'
): Promise<ImageAnalysisResponse> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    // Usar el endpoint del backend
    const response = await fetch(`${API_BASE_URL}/mobile-generator/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        image: base64Image,
        projectType: projectType
      })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: result.success,
      description: result.description,
      error: result.error
    };
    
  } catch (error) {
    console.error('Error analizando imagen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Genera un proyecto Flutter/Angular desde una descripción
 */
export const generateProjectFromDescription = async (
  request: ProjectGenerationRequest
): Promise<ProjectGenerationResponse> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    // Crear la aplicación móvil primero
    const createResponse = await fetch(`${API_BASE_URL}/mobile-generator/from-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        prompt: request.description,
        project_type: request.projectType,
        nombre: request.nombre
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Error creando aplicación: ${createResponse.status}`);
    }

    const createdApp = await createResponse.json();
    
    // Generar el proyecto
    const generateResponse = await fetch(`${API_BASE_URL}/mobile-generator/${createdApp.id}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!generateResponse.ok) {
      throw new Error(`Error generando proyecto: ${generateResponse.status}`);
    }

    // Si la respuesta es un archivo ZIP
    if (generateResponse.headers.get('content-type')?.includes('application/zip')) {
      const blob = await generateResponse.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl
      };
    }

    // Si es una respuesta JSON con error
    const result = await generateResponse.json();
    return {
      success: false,
      error: result.message || 'Error generando proyecto'
    };
    
  } catch (error) {
    console.error('Error generando proyecto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Flujo completo: analizar imagen y generar proyecto
 */
export const analyzeImageAndGenerateProject = async (
  base64Image: string,
  projectType: 'flutter' | 'angular' = 'flutter',
  projectName?: string
): Promise<ProjectGenerationResponse> => {
  try {
    // Paso 1: Analizar imagen
    const analysisResult = await analyzeImageForProject(base64Image, projectType);
    
    if (!analysisResult.success || !analysisResult.description) {
      return {
        success: false,
        error: analysisResult.error || 'Error analizando imagen'
      };
    }

    // Paso 2: Generar proyecto desde descripción
    const generationResult = await generateProjectFromDescription({
      description: analysisResult.description,
      projectType,
      nombre: projectName
    });

    return generationResult;
    
  } catch (error) {
    console.error('Error en flujo completo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Convierte un archivo a base64 con compresión automática
 */
export const fileToBase64 = (file: File, compress: boolean = true): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (compress && file.type.startsWith('image/')) {
        // Comprimir imagen antes de convertir a base64
        const compressedBase64 = await compressImage(file, 1024, 0.8);
        resolve(compressedBase64);
      } else {
        // Conversión normal sin compresión
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Valida que el archivo sea una imagen válida
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Verificar tipo de archivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Use JPEG, PNG, GIF o WebP.'
    };
  }

  // Verificar tamaño (máximo 20MB para archivo original, se comprimirá)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 20MB.'
    };
  }

  return { valid: true };
};

/**
 * Obtiene información sobre el tamaño de la imagen comprimida
 */
export const getImageInfo = (base64Image: string): { sizeKB: number; format: string } => {
  // Calcular tamaño aproximado del base64
  const base64Length = base64Image.length;
  const sizeBytes = (base64Length * 3) / 4; // Aproximación del tamaño en bytes
  const sizeKB = Math.round(sizeBytes / 1024);
  
  // Extraer formato
  const format = base64Image.split(';')[0].split('/')[1] || 'unknown';
  
  return { sizeKB, format };
};

export type { ImageAnalysisResponse, ProjectGenerationRequest, ProjectGenerationResponse }; 