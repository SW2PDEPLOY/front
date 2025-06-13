import React from 'react';

interface SaveDialogProps {
  newFileName: string;
  loadingSave: boolean;
  onChangeFileName: (name: string) => void;
  onSaveConfirm: () => void;
  onCancel: () => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  newFileName,
  loadingSave,
  onChangeFileName,
  onSaveConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Guardar Diagrama</h3>
        <p className="mb-4">Ingrese el nombre del archivo:</p>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={newFileName}
          onChange={(e) => onChangeFileName(e.target.value)}
          placeholder="nombre-archivo.drawio.xml"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={onSaveConfirm}
            disabled={loadingSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
