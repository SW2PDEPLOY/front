import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawIoEmbedRef } from 'react-drawio';
import { MockupSaveDialog } from '../components/MockupSaveDialog';
import { ErrorMessage } from '../components/ErrorMessage';
import { useDiagramManager } from '../hooks/useDiagramManager';
import { createEmptyMockup } from '../utils';

export const NewMockupPage = () => {
  const navigate = useNavigate();
  const drawioRef = useRef<DrawIoEmbedRef>(null);
  
  const {
    error,
    showMockupSaveDialog,
    mockupFileName,
    loadingSave,
    setError,
    setShowMockupSaveDialog,
    setMockupFileName,
    setXmlContent,
    handleMockupSaveConfirm,
  } = useDiagramManager(drawioRef);
  
  // When component mounts, trigger new mockup creation
  useEffect(() => {
    // Crear un nuevo mockup vacío
    const emptyMockup = createEmptyMockup();
    setXmlContent(emptyMockup);
    setShowMockupSaveDialog(true);
  }, []);
  
  // Handle save confirmation with redirect
  const handleSaveWithRedirect = async () => {
    try {
      const createdId = await handleMockupSaveConfirm();
      if (createdId) {
        // Si tenemos un ID, redirigir a la página de edición
        navigate(`/edit/mockup/${createdId}`);
      } else {
        // Si no tenemos ID (error o no se pudo guardar en API), ir a la lista de diagramas
        navigate('/diagrams');
      }
    } catch (error) {
      console.error('Error saving mockup:', error);
    }
  };
  
  return (
    <div className="w-full h-full min-h-screen bg-gray-50 flex flex-col">
      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {showMockupSaveDialog && (
        <MockupSaveDialog
          mockupFileName={mockupFileName}
          loadingSave={loadingSave}
          onChangeFileName={setMockupFileName}
          onSaveConfirm={handleSaveWithRedirect}
          onCancel={() => navigate('/')}
        />
      )}
    </div>
  );
}; 