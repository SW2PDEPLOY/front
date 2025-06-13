import { useRef, useState, useEffect } from 'react';
import { DrawIoEmbedRef } from 'react-drawio';
import { useNavigate, useParams } from 'react-router-dom';

// Components
import { ClassView } from '../components/ClassView';
import { DiagramEditor } from '../components/DiagramEditor';
import { DiagramHeader } from '../components/DiagramHeader';
import { DiagramManager } from '../components/DiagramManager';
import { FileSelector } from '../components/FileSelector';
import { ImageMockupConverter } from '../components/ImageMockupConverter';
import { MobileAppManager } from '../components/MobileAppManager';
import { MockupSaveDialog } from '../components/MockupSaveDialog';
import { SaveDialog } from '../components/SaveDialog';

// Custom hooks and services
import { useDiagramManager } from '../hooks/useDiagramManager';
import { authApi, diagramasApi, mockupsApi, mobileAppsApi } from '../services/apiService';

export const DiagramsPage = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type?: string; id?: string }>();
  const drawioRef = useRef<DrawIoEmbedRef | null>(null);
  const [loadingAngular, setLoadingAngular] = useState(false);
  const [loadingFlutter, setLoadingFlutter] = useState(false);
  const [showMobileAppManager, setShowMobileAppManager] = useState(false);

  const {
    xmlContent,
    error,
    classes,
    showClasses,
    loadingExtract,
    loadingMockup,
    loadingSave,
    fileName,
    showSaveDialog,
    newFileName,
    showMockupSaveDialog,
    mockupFileName,
    availableFiles,
    showFileSelector,
    files,
    currentFile,
    showDiagramManager,
    showImageConverter,
    setShowClasses,
    setShowSaveDialog,
    setNewFileName,
    setShowMockupSaveDialog,
    setMockupFileName,
    setShowDiagramManager,
    setShowImageConverter,
    setXmlContent,
    setError,
    handleCreateNewDiagram,
    handleToggleFileSelector,
    handleFileSelect,
    handleExtractClasses,
    // handleFileImport,
    handleSaveAsConfirm,
    handleDownload,
    handleAutoSave,
    handleConvertToMockup,
    handleMockupSaveConfirm,
    handleToggleDiagramManager,
    handleRenameDiagram,
    handleDeleteDiagram,
    handleToggleImageConverter,
    handleImageMockupGenerated,
    handleExportXml
  } = useDiagramManager(drawioRef);

  // Handle error from API
  const handleApiError = (error: any) => {
    console.error('Error cargando desde API:', error);
    
    if (error.response?.status === 401) {
      // Si hay un error de autenticación, redirigir al login
      authApi.logout();
      navigate('/login');
    }
    
    return null;
  };
  
  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  // Cargar diagrama o mockup desde la API si estamos en la ruta /edit/:type/:id
  useEffect(() => {
    const loadItemFromApi = async () => {
      if (!type || !id) return;

      try {
        let content = null;
        let name = '';

        if (type === 'diagram') {
          // Cargar diagrama desde la API
          const diagramData = await diagramasApi.getById(id).catch(handleApiError);
          if (diagramData) {
            content = diagramData.xml;
            name = `${diagramData.nombre}.drawio.xml`;
            console.log(`Diagrama cargado: ${name}`);
          }
        } else if (type === 'mockup') {
          // Cargar mockup desde la API
          const mockupData = await mockupsApi.getById(id).catch(handleApiError);
          if (mockupData) {
            content = mockupData.xml;
            name = `${mockupData.nombre}.drawio.xml`;
            console.log(`Mockup cargado: ${name}`);
          }
        }

        if (content) {
          // Guardar temporalmente en localStorage para que el autoguardado funcione
          localStorage.setItem("currentDiagramName", name);
          localStorage.setItem("currentDiagramId", id);
          localStorage.setItem("currentDiagramType", type);
          console.log(`Datos del diagrama guardados en localStorage para autoguardado`);
          
          // Actualizar el estado del componente
          setXmlContent(content);
          setShowClasses(false);
        }
      } catch (error) {
        console.error('Error cargando el contenido:', error);
      }
    };

    loadItemFromApi();
  }, [type, id, navigate, setXmlContent, setShowClasses]);
  
  const handleGoHome = () => {
    navigate('/');
  };

  const handleToggleMobileAppManager = () => {
    setShowMobileAppManager(!showMobileAppManager);
  };

  // Función para generar código Angular
  const handleGenerateAngular = async () => {
    if (!xmlContent) {
      setError('No hay contenido para generar aplicación Angular');
      return;
    }

    try {
      setLoadingAngular(true);
      
      // Llamar al nuevo endpoint para generar la aplicación Angular
      const blob = await mobileAppsApi.generateAngularFromXml(xmlContent);
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal para descargar el archivo
      const a = document.createElement('a');
      a.href = url;
      const fileName = currentFile ? currentFile.toString() : mockupFileName || 'angular-project';
      a.download = fileName.replace(/\.(drawio|xml)$/, '') + '-angular.zip';
      
      // Agregar el elemento al DOM y hacer clic en él
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de la descarga
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generando aplicación Angular:', error);
      setError('Error al generar aplicación Angular. Inténtelo de nuevo más tarde.');
    } finally {
      setLoadingAngular(false);
    }
  };

  // Función para generar aplicación Flutter
  const handleGenerateFlutter = async () => {
    if (!xmlContent) {
      setError('No hay contenido para generar aplicación Flutter');
      return;
    }

    try {
      setLoadingFlutter(true);
      
      // Llamar al endpoint para generar la aplicación Flutter
      const blob = await mobileAppsApi.generateFlutterFromXml(xmlContent);
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal para descargar el archivo
      const a = document.createElement('a');
      a.href = url;
      const fileName = currentFile ? currentFile.toString() : mockupFileName || 'flutter-project';
      a.download = fileName.replace(/\.(drawio|xml)$/, '') + '-flutter.zip';
      
      // Agregar el elemento al DOM y hacer clic en él
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de la descarga
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generando aplicación Flutter:', error);
      setError('Error al generar aplicación Flutter. Inténtelo de nuevo más tarde.');
    } finally {
      setLoadingFlutter(false);
    }
  };

  // Modificar estas funciones para redirigir después de crear un mockup
  const handleConvertToMockupWithRedirect = async () => {
    // Primero llamar a la función original de conversión
    handleConvertToMockup();
  };

  const handleMockupSaveConfirmWithRedirect = async () => {
    try {
      const createdId = await handleMockupSaveConfirm();
      if (createdId) {
        // Si tenemos un ID, redirigir a la página de edición
        navigate(`/edit/mockup/${createdId}`);
      }
    } catch (error) {
      console.error('Error saving mockup:', error);
    }
  };

  return (
    <div className="diagram-page w-full h-full min-h-screen bg-gray-50 flex flex-col">
      {/* Header toolbar with buttons */}
        <DiagramHeader
          xmlContent={xmlContent}
          showFileSelector={showFileSelector}
          loadingExtract={loadingExtract}
          loadingMockup={loadingMockup}
          loadingAngular={loadingAngular}
          loadingFlutter={loadingFlutter}
          onToggleFileSelector={handleToggleFileSelector}
          onToggleDiagramManager={handleToggleDiagramManager}
          onToggleImageConverter={handleToggleImageConverter}
          onToggleMobileAppManager={handleToggleMobileAppManager}
          onExtractClasses={handleExtractClasses}
          onConvertToMockup={handleConvertToMockupWithRedirect}
          onGenerateAngular={type === 'mockup' ? handleGenerateAngular : undefined}
          onGenerateFlutter={type === 'mockup' ? handleGenerateFlutter : undefined}
          onDownload={handleDownload}
          onExportXml={handleExportXml}
          onCreateNew={handleCreateNewDiagram}
          onLogout={handleLogout}
          onGoHome={handleGoHome}
        />

      {/* File selector overlay */}
      {showFileSelector && (
        <FileSelector
          availableFiles={availableFiles}
          fileName={fileName}
          onFileSelect={handleFileSelect}
          onNewDiagram={handleCreateNewDiagram}
        />
      )}

      {/* Save dialog */}
      {showSaveDialog && (
        <SaveDialog
          newFileName={newFileName}
          loadingSave={loadingSave}
          onChangeFileName={setNewFileName}
          onSaveConfirm={handleSaveAsConfirm}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}

      {/* Mockup save dialog */}
      {showMockupSaveDialog && (
        <MockupSaveDialog
          mockupFileName={mockupFileName}
          loadingSave={loadingSave}
          onChangeFileName={setMockupFileName}
          onSaveConfirm={handleMockupSaveConfirmWithRedirect}
          onCancel={() => setShowMockupSaveDialog(false)}
        />
      )}

      {/* Diagram manager dialog */}
      {showDiagramManager && (
        <DiagramManager
          availableFiles={availableFiles}
          onRename={handleRenameDiagram}
          onDelete={handleDeleteDiagram}
          onSelectFile={handleFileSelect}
          onClose={() => setShowDiagramManager(false)}
        />
      )}

      {/* Image to mockup converter */}
      {showImageConverter && (
        <ImageMockupConverter
          onMockupGenerated={handleImageMockupGenerated}
          onClose={() => setShowImageConverter(false)}
        />
      )}

      {/* Mobile App Manager */}
      {showMobileAppManager && (
        <MobileAppManager
          onClose={() => setShowMobileAppManager(false)}
        />
      )}

      {/* Main content area */}
      {showClasses ? (
        <ClassView
          classes={classes}
          onBackToDiagram={() => setShowClasses(false)}
          onDownload={handleDownload}
          onGoHome={handleGoHome}
        />
      ) : (
        <DiagramEditor
          ref={drawioRef}
          xmlContent={xmlContent || ''}
          fileName={fileName}
          currentFile={currentFile}
          files={files}
          onAutoSave={handleAutoSave}
          setXmlContent={setXmlContent}
        />
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md fixed top-4 left-4 z-50 max-w-md">
          {error}
          <button
            className="absolute top-1 right-1 text-red-600 hover:text-red-900"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}; 