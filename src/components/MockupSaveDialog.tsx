import React from 'react';

interface MockupSaveDialogProps {
  mockupFileName: string;
  loadingSave: boolean;
  onChangeFileName: (name: string) => void;
  onSaveConfirm: () => void;
  onCancel: () => void;
}

export const MockupSaveDialog: React.FC<MockupSaveDialogProps> = ({
  mockupFileName,
  loadingSave,
  onChangeFileName,
  onSaveConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Guardar Mockup</h2>

        <div className="mb-6">
          <label htmlFor="mockupFileName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del mockup
          </label>
          <input
            type="text"
            id="mockupFileName"
            value={mockupFileName}
            onChange={(e) => onChangeFileName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nombre del archivo"
            autoFocus
          />
          <p className="mt-1 text-sm text-gray-500">
            Se guardará como: {mockupFileName.endsWith('.drawio.xml') ? mockupFileName : `${mockupFileName}.drawio.xml`}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            onClick={onSaveConfirm}
            disabled={!mockupFileName.trim() || loadingSave}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!mockupFileName.trim() || loadingSave
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {loadingSave ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
