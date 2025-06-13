// Utility functions for file and storage management

/**
 * Load files list from localStorage
 */
export const loadFilesFromLocalStorage = (): string[] => {
  try {
    const savedFiles = localStorage.getItem("drawioFiles");
    if (!savedFiles) return [];

    // Parse the files list
    const filesList = JSON.parse(savedFiles);

    // Validate that it's an array and filter out any invalid entries
    if (!Array.isArray(filesList)) return [];

    // Filter out any entry named 'diagrams' and ensure all entries are valid
    return filesList.filter((file) => {
      // Skip the problematic 'diagrams' file
      if (file === "diagrams") return false;

      // Check if the file exists in localStorage
      const storageKey = `drawio_${file}`;
      const content = localStorage.getItem(storageKey);

      // Only keep files that exist and have valid content
      return (
        !!content &&
        (content.includes("<mxGraphModel") || content.includes("<mxfile"))
      );
    });
  } catch (error) {
    console.error("Error loading files from localStorage:", error);
    return [];
  }
};

/**
 * Save files list to localStorage
 */
export const saveFilesListToLocalStorage = (filesList: string[]): void => {
  try {
    // Filter out the problematic 'diagrams' entry
    const validFiles = filesList.filter((file) => file !== "diagrams");
    localStorage.setItem("drawioFiles", JSON.stringify(validFiles));

    console.log("Files list saved to localStorage:", validFiles);
  } catch (error) {
    console.error("Error saving file list to localStorage:", error);
  }
};

/**
 * Load a diagram from localStorage
 */
export const loadFromLocalStorage = (name: string): string | null => {
  if (!name) {
    console.error("Cannot load from localStorage: missing name");
    return null;
  }

  try {
    const key = `drawio_${name}`;
    const content = localStorage.getItem(key);

    if (content) {
      console.log(
        `Loaded from localStorage: ${key}, content length: ${content.length}`
      );
      return content;
    }

    console.warn(`Content not found in localStorage for key: ${key}`);
    return null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

/**
 * Save a diagram to localStorage
 */
export const saveToLocalStorage = (name: string, xml: string): boolean => {
  if (!name || !xml) {
    console.error("Cannot save to localStorage: missing name or content");
    return false;
  }

  try {
    const key = `drawio_${name}`;
    localStorage.setItem(key, xml);
    localStorage.setItem("lastOpenedFile", name);
    console.log(`Saved to localStorage: ${key}, content length: ${xml.length}`);
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

/**
 * Update the available files list from localStorage
 */
export const updateAvailableFilesList = (): {
  path: string;
  name: string;
}[] => {
  console.log("Actualizando lista de archivos disponibles...");

  try {
    // Limpiar localStorage de entradas duplicadas o inválidas
    const keysToCheck: string[] = [];
    const validDiagramKeys = new Set<string>();

    // Primera pasada: recopilar todas las claves que parecen ser diagramas
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("drawio_")) {
        keysToCheck.push(key);
      }
    }

    console.log(
      `Encontradas ${keysToCheck.length} claves que comienzan con 'drawio_'`
    );

    // Segunda pasada: verificar cuáles contienen XML válido
    for (const key of keysToCheck) {
      const content = localStorage.getItem(key);
      const filename = key.replace("drawio_", "");

      // Skip the problematic 'diagrams' file
      if (filename === "diagrams") {
        console.log('Ignorando archivo problemático "diagrams"');
        localStorage.removeItem(key);
        continue;
      }

      if (
        content &&
        (content.includes("<mxGraphModel") || content.includes("<mxfile"))
      ) {
        validDiagramKeys.add(filename);
        console.log(`Diagrama válido encontrado: ${filename}`);
      } else {
        // Eliminar entradas inválidas para limpiar el almacenamiento
        console.warn(
          `Diagrama inválido en localStorage: ${key}, eliminando...`
        );
        localStorage.removeItem(key);
      }
    }

    const diagramKeys = Array.from(validDiagramKeys);
    console.log(`Total de diagramas válidos: ${diagramKeys.length}`);

    if (diagramKeys.length > 0) {
      // Crear objetos con la información de cada diagrama
      const fileList = diagramKeys.map((name) => {
        // Usamos timestamp actual como timestamp del archivo
        const timestamp = Date.now();
        const lastModified = new Date(timestamp).toLocaleString();

        return {
          path: name,
          name: name,
          lastModified,
        };
      });

      // Ordenar por nombre (podría mejorarse para ordenar por fecha)
      fileList.sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `Lista de archivos actualizada con ${fileList.length} diagramas`
      );
      return fileList;
    } else {
      console.log("No se encontraron diagramas válidos en localStorage");
      return [];
    }
  } catch (err) {
    console.error("Error al actualizar la lista de archivos:", err);
    return [];
  }
};

/**
 * Creates a template for an empty diagram
 */
export const createEmptyDiagram = (): string => {
  return `
    <mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Diagram Maker">
      <diagram id="diagram-1" name="Página-1">
        <mxGraphModel dx="1422" dy="798" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
          <root>
            <mxCell id="0" />
            <mxCell id="1" parent="0" />
          </root>
        </mxGraphModel>
      </diagram>
    </mxfile>
  `;
};

/**
 * Rename a diagram file
 */
export const renameFile = (oldName: string, newName: string): boolean => {
  try {
    // Get the content of the old file
    const content = loadFromLocalStorage(oldName);
    if (!content) {
      console.error(`File not found: ${oldName}`);
      return false;
    }

    // Save with the new name
    const saveResult = saveToLocalStorage(newName, content);
    if (!saveResult) {
      console.error(`Failed to save with new name: ${newName}`);
      return false;
    }

    // Delete the old file
    deleteFile(oldName);

    // Update the files list
    const files = loadFilesFromLocalStorage();
    const updatedFiles = files.filter((file) => file !== oldName);
    updatedFiles.push(newName);
    saveFilesListToLocalStorage(updatedFiles);

    // If this was the last opened file, update that too
    const lastOpenedFile = localStorage.getItem("lastOpenedFile");
    if (lastOpenedFile === oldName) {
      localStorage.setItem("lastOpenedFile", newName);
    }

    console.log(`Renamed ${oldName} to ${newName}`);
    return true;
  } catch (error) {
    console.error(`Error renaming file from ${oldName} to ${newName}:`, error);
    return false;
  }
};

/**
 * Delete a diagram file
 */
export const deleteFile = (fileName: string): boolean => {
  try {
    // Remove from localStorage using the correct key prefix
    localStorage.removeItem(`drawio_${fileName}`);

    // Update the files list
    const files = loadFilesFromLocalStorage();
    const updatedFiles = files.filter((file) => file !== fileName);
    saveFilesListToLocalStorage(updatedFiles);

    // If this was the last opened file, clear that
    const lastOpenedFile = localStorage.getItem("lastOpenedFile");
    if (lastOpenedFile === fileName) {
      localStorage.removeItem("lastOpenedFile");
    }

    console.log(`Deleted ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
    return false;
  }
};
