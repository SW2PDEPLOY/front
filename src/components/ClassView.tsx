import React from 'react';
import { ClassInfo } from '../types/diagram';
import { ClassTree } from './ClassTree';

interface ClassViewProps {
  classes: ClassInfo[];
  onBackToDiagram: () => void;
  onDownload: () => void;
  onGoHome: () => void;
}

export const ClassView: React.FC<ClassViewProps> = ({
  classes,
  onBackToDiagram,
  onDownload,
  onGoHome
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Clases y Atributos del Diagrama</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onBackToDiagram}
          >
            Volver al Diagrama
          </button>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onDownload}
          >
            Descargar Diagrama
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onGoHome}
          >
            Ir a Inicio
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-600 italic">
          No se encontraron clases en el diagrama.
        </div>
      ) : (
        <>
          {/* Vista jerárquica */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Visualización jerárquica</h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ClassTree classes={classes} />
            </div>
          </div>

          {/* Vista de cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {classes.map((classInfo, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-blue-600 mb-4 pb-2 border-b border-gray-200">{classInfo.name}</h3>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Atributos:</h4>
                  {classInfo.attributes.length === 0 ? (
                    <p className="text-gray-500 italic">No tiene atributos.</p>
                  ) : (
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {classInfo.attributes.map((attr, attrIndex) => (
                        <li key={attrIndex} className="flex items-baseline">
                          <span className="font-medium">{attr.name}</span>
                          <span className="text-gray-400 mx-2">:</span>
                          <span className="text-green-600">{attr.type}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
