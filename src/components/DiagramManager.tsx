import { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';

interface DiagramFile {
  name: string;
  path: string;
}

interface DiagramManagerProps {
  availableFiles: DiagramFile[];
  onRename: (oldName: string, newName: string) => Promise<boolean>;
  onDelete: (fileName: string) => Promise<boolean>;
  onSelectFile: (path: string) => Promise<boolean>;
  onClose: () => void;
}

export const DiagramManager: React.FC<DiagramManagerProps> = ({
  availableFiles,
  onRename,
  onDelete,
  onSelectFile,
  onClose
}) => {
  const [diagrams, setDiagrams] = useState<DiagramFile[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDiagrams(availableFiles);
  }, [availableFiles]);

  const handleStartEditing = (index: number) => {
    const diagram = diagrams[index];
    // Remove extension for editing
    const nameWithoutExt = diagram.name.replace(/\.drawio\.xml$/, '');
    setNewName(nameWithoutExt);
    setEditingIndex(index);
    setDeleteConfirmIndex(null);
  };

  const handleCancelEditing = () => {
    setEditingIndex(null);
    setNewName('');
  };

  const handleSaveNewName = async (index: number) => {
    if (!newName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    setError(null);

    const oldName = diagrams[index].name;
    // Ensure the new name has the correct extension
    const formattedNewName = newName.endsWith('.drawio.xml')
      ? newName
      : `${newName}.drawio.xml`;

    try {
      const success = await onRename(oldName, formattedNewName);
      if (success) {
        // Update local state
        const updatedDiagrams = [...diagrams];
        updatedDiagrams[index] = {
          ...updatedDiagrams[index],
          name: formattedNewName,
        };
        setDiagrams(updatedDiagrams);
        setEditingIndex(null);
      } else {
        setError('No se pudo renombrar el diagrama');
      }
    } catch (err) {
      setError('Error al renombrar el diagrama');
      console.error('Error renaming diagram:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = (index: number) => {
    setDeleteConfirmIndex(index);
    setEditingIndex(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmIndex(null);
  };

  const handleDeleteDiagram = async (index: number) => {
    setLoading(true);
    setError(null);

    try {
      const fileName = diagrams[index].name;
      const success = await onDelete(fileName);

      if (success) {
        // Remove from local state
        const updatedDiagrams = diagrams.filter((_, i) => i !== index);
        setDiagrams(updatedDiagrams);
      } else {
        setError('No se pudo eliminar el diagrama');
      }
    } catch (err) {
      setError('Error al eliminar el diagrama');
      console.error('Error deleting diagram:', err);
    } finally {
      setLoading(false);
      setDeleteConfirmIndex(null);
    }
  };

  const handleSelectDiagram = async (path: string) => {
    setLoading(true);
    setError(null);

    try {
      await onSelectFile(path);
      onClose(); // Close manager after selection
    } catch (err) {
      setError('Error al cargar el diagrama');
      console.error('Error selecting diagram:', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestor de Diagramas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-y-auto flex-grow">
          {diagrams.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diagrams.map((diagram, index) => (
                  <tr key={diagram.path} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                      ) : (
                        <button
                          className="text-indigo-600 hover:text-indigo-900 text-left font-medium w-full overflow-hidden text-ellipsis"
                          onClick={() => handleSelectDiagram(diagram.path)}
                        >
                          {diagram.name}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {editingIndex === index ? (
                        <>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 disabled:opacity-50"
                            onClick={() => handleSaveNewName(index)}
                            disabled={loading}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                            onClick={handleCancelEditing}
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : deleteConfirmIndex === index ? (
                        <>
                          <span className="text-sm text-red-600 mr-2">¿Confirmar eliminar?</span>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 disabled:opacity-50"
                            onClick={() => handleDeleteDiagram(index)}
                            disabled={loading}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                            onClick={handleCancelDelete}
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                            onClick={() => handleStartEditing(index)}
                            title="Renombrar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                            onClick={() => handleConfirmDelete(index)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay diagramas guardados
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
