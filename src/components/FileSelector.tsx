import React from 'react';

interface FileSelectorProps {
  availableFiles: { path: string; name: string }[];
  fileName: string;
  onFileSelect: (path: string) => void;
  onNewDiagram: () => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  availableFiles,
  fileName,
  onFileSelect,
  onNewDiagram
}) => {
  return (
    <div className="fixed top-16 right-4 z-50 bg-white rounded-md shadow-xl p-4 w-64">
      <h3 className="text-lg font-semibold mb-2">Diagramas guardados</h3>
      {availableFiles.length === 0 ? (
        <p className="text-gray-500 italic">No hay diagramas guardados.</p>
      ) : (
        <ul className="max-h-60 overflow-y-auto">
          {availableFiles.map((file, index) => (
            <li key={index} className="mb-1">
              <button
                className={`text-left w-full py-2 px-3 rounded-md hover:bg-gray-100 ${fileName === file.name ? 'bg-blue-100 text-blue-800' : ''}`}
                onClick={() => onFileSelect(file.path)}
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          onClick={onNewDiagram}
        >
          Nuevo diagrama
        </button>
      </div>
    </div>
  );
};
