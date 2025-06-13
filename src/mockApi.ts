// Simula una API para verificar archivos
// En un entorno real, esto sería un endpoint del servidor

export const checkFileExists = async (fileName: string): Promise<{ exists: boolean, path?: string }> => {
  // En un escenario real, esto haría una solicitud al servidor
  // Aquí simplemente simularemos que el archivo existe si es test.drawio.xml
  
  if (fileName === 'test.drawio.xml') {
    return { exists: true, path: '/assets/' + fileName };
  }
  
  return { exists: false };
};

export const saveFile = async (fileName: string): Promise<{ success: boolean, path?: string }> => {
  // En un escenario real, esto enviaría el contenido al servidor para guardarlo
  // Aquí solo simularemos una respuesta exitosa
  
  console.log(`[MOCK API] Guardando archivo: ${fileName}`);
  // Simular una demora de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { 
    success: true, 
    path: '/assets/' + fileName 
  };
}; 