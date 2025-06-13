import React from 'react';
// import { saveFileToAssets } from '../services/fileService';
import { loadFromLocalStorage } from './fileManager';
import { ClassInfo } from '../types/diagram';
import { extractClassesFromXml } from './diagramProcessor';

/**
 * Create a new blank diagram
 */
export const createBlankDiagram = (
  setXmlContent: (xml: string | null) => void,
  setClasses: (classes: ClassInfo[]) => void,
  setShowClasses: (show: boolean) => void,
  setCurrentFile: (file: string) => void,
  setFileName: (name: string) => void,
  setError: (error: string | null) => void,
  setShowSaveDialog: (show: boolean) => void
): void => {
  // Clear any existing content
  setXmlContent(null);
  setClasses([]);
  setShowClasses(false);
  setCurrentFile('');
  setFileName('');
  setError(null);

  // Show the save dialog to name the new diagram
  setShowSaveDialog(true);
};

/**
 * Toggle file selector
 */
export const toggleFileSelector = (
  showFileSelector: boolean,
  setShowFileSelector: (show: boolean) => void,
  refreshAvailableFiles: () => void,
  listAssetsFiles: () => Promise<{ path: string; lastModified: string }[]>,
  availableFiles: { path: string; name: string }[],
  setAvailableFiles: React.Dispatch<React.SetStateAction<{ path: string; name: string }[]>>
): void => {
  const newState = !showFileSelector;
  setShowFileSelector(newState);

  // If we're opening the selector, update the file list
  if (newState) {
    console.log('Abriendo selector de archivos, actualizando lista...');

    // First update from localStorage
    refreshAvailableFiles();

    // Then complement with files from the simulated system
    listAssetsFiles().then(files => {
      console.log(`Encontrados ${files.length} archivos en assets`);

      // Combine with files already detected in localStorage
      const existingPaths = availableFiles.map(f => f.path);

      // Filter only drawio files
      const drawioFiles = files.filter(file =>
        file.path.endsWith('.drawio.xml') ||
        file.path.endsWith('.drawio')
      );

      // Add only those that aren't already in the list
      const additionalFiles = drawioFiles
        .filter(file => {
          const filename = file.path.split('/').pop() || '';
          return !existingPaths.includes(filename);
        })
        .map(file => {
          const name = file.path.split('/').pop() || '';
          return {
            path: file.path,
            name: name
          };
        });

      if (additionalFiles.length > 0) {
        console.log(`Agregando ${additionalFiles.length} archivos de assets a la lista`);
        setAvailableFiles((prev: { path: string; name: string }[]) => [...prev, ...additionalFiles]);
      }
    }).catch(err => {
      console.error('Error al listar archivos de assets:', err);
    });
  }
};

/**
 * Load a file from localStorage
 */
export const loadDiagram = (
  fileName: string,
  setXmlContent: (xml: string | null) => void,
  setCurrentFile: (file: string) => void,
  setError: (error: string | null) => void
): void => {
  console.log(`Loading file: ${fileName}`);
  const content = loadFromLocalStorage(fileName);

  if (content) {
    console.log(`Loaded content length: ${content.length}`);
    console.log(`First 100 chars: ${content.substring(0, 100)}`);

    // Verify the content is valid DrawIO XML
    const isValid = content.includes('<mxGraphModel') || content.includes('<mxfile');
    console.log(`Content is valid DrawIO XML: ${isValid}`);

    if (isValid) {
      // Use the loaded diagram
      setXmlContent(content);
      setCurrentFile(fileName);
      localStorage.setItem('lastOpenedFile', fileName);

      // Try to extract classes
      console.log('Extracting classes from loaded file...');
      const extractedClasses = extractClassesFromXml(content);

      if (extractedClasses.length > 0) {
        console.log(`Successfully extracted ${extractedClasses.length} classes`);
      } else {
        console.warn('No classes found in the loaded diagram');
      }
    } else {
      console.error('Invalid DrawIO XML content');
      setError('Error: Invalid diagram format');
    }
  } else {
    console.error(`File not found: ${fileName}`);
    setError(`Error: File not found - ${fileName}`);
  }
}; 