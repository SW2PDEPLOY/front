import React, { useState } from 'react';
import {
  FolderOpen,
  FileDown,
  Code,
  FilePlus,
  Image,
  ChevronRight,
  Menu,
  Layout,
  List,
  Upload,
  LogOut,
  Home,
  Smartphone,
  Globe
} from 'lucide-react';

interface DiagramHeaderProps {
  xmlContent: string | null;
  showFileSelector: boolean;
  loadingExtract: boolean;
  loadingMockup?: boolean;
  loadingAngular?: boolean;
  loadingFlutter?: boolean;
  onToggleFileSelector: () => void;
  onToggleDiagramManager: () => void;
  onToggleImageConverter: () => void;
  onToggleMobileAppManager: () => void;
  onExtractClasses: () => void;
  onConvertToMockup?: () => void;
  onGenerateAngular?: () => void;
  onGenerateFlutter?: () => void;
  onDownload: () => void;
  onExportXml: () => void;
  onCreateNew: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const DiagramHeader: React.FC<DiagramHeaderProps> = ({
  xmlContent,
  // showFileSelector,
  loadingExtract,
  loadingMockup = false,
  loadingAngular = false,
  loadingFlutter = false,
  onToggleFileSelector,
  onToggleDiagramManager,
  onToggleImageConverter,
  onToggleMobileAppManager,
  onExtractClasses,
  onConvertToMockup,
  onGenerateAngular,
  onGenerateFlutter,
  onDownload,
  onExportXml,
  onCreateNew,
  onLogout,
  onGoHome
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`fixed top-0 ${isExpanded ? 'right-0' : '-right-12'} h-full z-50 flex transition-all duration-300`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleExpand}
        className="absolute top-4 left-0 transform -translate-x-12 bg-indigo-600 text-white p-2 rounded-l-md shadow-lg hover:bg-indigo-700 transition-all duration-300"
        aria-label={isExpanded ? "Collapse toolbar" : "Expand toolbar"}
      >
        {isExpanded ? <ChevronRight size={20} /> : <Menu size={20} />}
      </button>

      {/* Main sidebar */}
      <div
        className={`bg-indigo-600 text-white py-8 px-3 h-full flex flex-col gap-6 shadow-xl transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
          onClick={onGoHome}
          title="Ir a inicio"
        >
          <Home size={20} />
          {isExpanded && <span className="font-medium">Ir a inicio</span>}
        </button>

        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
          onClick={onToggleFileSelector}
          title="Abrir diagrama"
        >
          <FolderOpen size={20} />
          {isExpanded && <span className="font-medium">Abrir diagrama</span>}
        </button>

        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
          onClick={onToggleDiagramManager}
          title="Gestionar diagramas"
        >
          <List size={20} />
          {isExpanded && <span className="font-medium">Gestionar diagramas</span>}
        </button>

        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
          onClick={onToggleImageConverter}
          title="Convertir imagen a mockup"
        >
          <Upload size={20} />
          {isExpanded && <span className="font-medium">Imagen a mockup</span>}
        </button>

        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
          onClick={onToggleMobileAppManager}
          title="Gestionar aplicaciones móviles"
        >
          <Smartphone size={20} />
          {isExpanded && <span className="font-medium">Apps móviles</span>}
        </button>

        {xmlContent && (
          <>
            <button
              className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 ${loadingExtract ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onExtractClasses}
              disabled={!xmlContent || loadingExtract}
              title="Extraer clases y atributos"
            >
              <Code size={20} />
              {isExpanded && (
                <span className="font-medium">
                  {loadingExtract ? (
                    <span className="flex items-center">
                      <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : 'Extraer clases'}
                </span>
              )}
            </button>

            {onConvertToMockup && (
              <button
                className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 ${loadingMockup ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onConvertToMockup}
                disabled={!xmlContent || loadingMockup}
                title="Convertir a Mockup"
              >
                <Layout size={20} />
                {isExpanded && (
                  <span className="font-medium">
                    {loadingMockup ? (
                      <span className="flex items-center">
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : 'Convertir a Mockup'}
                  </span>
                )}
              </button>
            )}
            
            {onGenerateFlutter && (
              <button
                className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 ${loadingFlutter ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onGenerateFlutter}
                disabled={!xmlContent || loadingFlutter}
                title="Generar aplicación Flutter"
              >
                <Smartphone size={20} />
                {isExpanded && (
                  <span className="font-medium">
                    {loadingFlutter ? (
                      <span className="flex items-center">
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : 'Generar Flutter'}
                  </span>
                )}
              </button>
            )}

            {onGenerateAngular && (
              <button
                className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 ${loadingAngular ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onGenerateAngular}
                disabled={!xmlContent || loadingAngular}
                title="Generar aplicación Angular"
              >
                <Globe size={20} />
                {isExpanded && (
                  <span className="font-medium">
                    {loadingAngular ? (
                      <span className="flex items-center">
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : 'Generar Angular'}
                  </span>
                )}
              </button>
            )}

            <button
              className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
              onClick={onDownload}
              disabled={!xmlContent}
              title="Descargar"
            >
              <FileDown size={20} />
              {isExpanded && <span className="font-medium">Descargar</span>}
            </button>

            <button
              className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
              onClick={onExportXml}
              disabled={!xmlContent}
              title="Exportar como PNG"
            >
              <Image size={20} />
              {isExpanded && <span className="font-medium">Exportar PNG</span>}
            </button>
          </>
        )}

        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors duration-200`}
          onClick={onCreateNew}
          title="Nuevo diagrama"
        >
          <FilePlus size={20} />
          {isExpanded && <span className="font-medium">Nuevo diagrama</span>}
        </button>

        {/* Spacer to push logout to the bottom */}
        <div className="flex-grow"></div>

        {/* Logout button at the bottom */}
        <button
          className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 py-2 px-3 rounded-md hover:bg-red-700 transition-colors duration-200 text-white mt-auto`}
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <LogOut size={20} />
          {isExpanded && <span className="font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
};
