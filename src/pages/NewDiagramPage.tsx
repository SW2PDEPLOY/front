import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawIoEmbedRef } from 'react-drawio';
import { SaveDialog } from '../components/SaveDialog';
import { ErrorMessage } from '../components/ErrorMessage';
import { useDiagramManager } from '../hooks/useDiagramManager';

export const NewDiagramPage = () => {
  const navigate = useNavigate();
  const drawioRef = useRef<DrawIoEmbedRef>(null);
  
  const {
    error,
    showSaveDialog,
    newFileName,
    loadingSave,
    setError,
    setShowSaveDialog,
    setNewFileName,
    handleSaveAsConfirm,
    handleCreateNewDiagram,
  } = useDiagramManager(drawioRef);
  
  // When component mounts, trigger new diagram creation
  useEffect(() => {
    handleCreateNewDiagram();
    setShowSaveDialog(true);
  }, []);
  
  // Handle save confirmation with redirect
  const handleSaveWithRedirect = async () => {
    try {
      const createdId = await handleSaveAsConfirm();
      if (createdId) {
        // Si tenemos un ID, redirigir a la página de edición
        navigate(`/edit/diagram/${createdId}`);
      } else {
        // Si no tenemos ID (error o no se pudo guardar en API), ir a la lista de diagramas
      navigate('/diagrams');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {error && (
        <ErrorMessage 
          message={error}
          onClose={() => setError(null)}
        />
      )}
      
      {showSaveDialog && (
        <SaveDialog
          newFileName={newFileName}
          loadingSave={loadingSave}
          onChangeFileName={setNewFileName}
          onSaveConfirm={handleSaveWithRedirect}
          onCancel={() => navigate('/')}
        />
      )}
    </div>
  );
}; 