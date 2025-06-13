import { ClassInfo } from "../types/diagram";
import { extractClassesFromXml, processXmlContent } from "./diagramProcessor";
import { saveToLocalStorage, loadFromLocalStorage } from "./fileManager";
import { convertToMockup } from "./mockupConverter";
import {
  downloadFile,
  saveFileToAssets,
  loadFileFromAssets,
} from "../services/fileService";

/**
 * Handles extracting classes from XML content
 */
export const extractClasses = async (
  xmlContent: string,
  setError: (error: string | null) => void,
  setLoadingExtract: (loading: boolean) => void,
  setClasses: (classes: ClassInfo[]) => void,
  setShowClasses: (show: boolean) => void
): Promise<void> => {
  if (!xmlContent) {
    console.error("No hay contenido XML para procesar");
    setError("No hay contenido XML para procesar");
    return;
  }

  // Clear existing state
  setError(null);
  setLoadingExtract(true);
  setShowClasses(false);

  try {
    console.log("Iniciando extracción de clases del diagrama actual...");

    // Process directly if we already have XML content
    const extractedClasses = extractClassesFromXml(xmlContent);

    if (extractedClasses && extractedClasses.length > 0) {
      console.log(
        `Encontradas ${extractedClasses.length} clases en el diagrama`
      );
      setClasses(extractedClasses);
      setShowClasses(true);
    } else {
      console.log(
        "No se encontraron clases con extractClassesFromXml, usando processXmlContent"
      );
      const processedClasses = processXmlContent(xmlContent);
      setClasses(processedClasses);
      setShowClasses(true);
    }
  } catch (error) {
    console.error("Error durante la extracción de clases:", error);
    setError("Error al extraer clases: " + (error as Error).message);
  } finally {
    setLoadingExtract(false);
  }
};

/**
 * Imports a file from user's computer
 */
export const importFile = (
  file: File,
  setError: (error: string | null) => void,
  setXmlContent: (xml: string | null) => void,
  setFileName: (name: string) => void,
  setCurrentFile: (name: string) => void,
  refreshAvailableFiles: () => void
): void => {
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const fileContent = e.target?.result as string;

      if (!fileContent) {
        setError("Error: No se pudo leer el contenido del archivo");
        return;
      }

      // Verify the content appears to be a DrawIO XML
      if (
        !fileContent.includes("<mxGraphModel") &&
        !fileContent.includes("<mxfile")
      ) {
        setError("Error: El archivo no parece ser un diagrama DrawIO válido");
        return;
      }

      // Save with the file name
      let fileName = file.name;
      if (!fileName.endsWith(".drawio.xml")) {
        fileName = fileName.endsWith(".xml")
          ? fileName.replace(".xml", ".drawio.xml")
          : `${fileName}.drawio.xml`;
      }

      // Save to localStorage
      const saveResult = saveToLocalStorage(fileName, fileContent);

      if (saveResult) {
        // Update state
        setXmlContent(fileContent);
        setFileName(fileName);
        setCurrentFile(fileName);

        // Also save to the simulated file system
        await saveFileToAssets(fileName, fileContent);

        // Update the file list
        refreshAvailableFiles();

        console.log(`Archivo importado correctamente: ${fileName}`);
      } else {
        setError("Error al guardar el archivo importado");
      }
    } catch (error) {
      console.error("Error al procesar el archivo importado:", error);
      setError("Error al procesar el archivo: " + (error as Error).message);
    }
  };

  reader.onerror = () => {
    setError("Error al leer el archivo");
  };

  reader.readAsText(file);
};

/**
 * Handles save dialog confirmation
 */
export const saveAsConfirm = async (
  newFileName: string,
  xmlContent: string | null,
  files: string[],
  setError: (error: string | null) => void,
  setLoadingSave: (loading: boolean) => void,
  setFiles: (files: string[]) => void,
  setFileName: (name: string) => void,
  setCurrentFile: (name: string) => void,
  setXmlContent: (xml: string | null) => void,
  refreshAvailableFiles: () => void,
  setShowSaveDialog: (show: boolean) => void,
  setNewFileName: (name: string) => void
): Promise<void> => {
  if (!newFileName || newFileName.trim() === "") {
    setError("Error: Debe ingresar un nombre para el archivo");
    return;
  }

  try {
    setLoadingSave(true);

    // Ensure the filename has the correct extension
    let filename = newFileName;
    if (!filename.endsWith(".drawio.xml")) {
      filename = filename.endsWith(".xml")
        ? filename.replace(".xml", ".drawio.xml")
        : `${filename}.drawio.xml`;
    }

    // Check if the file already exists
    const localStorageExists = !!loadFromLocalStorage(filename);

    if (localStorageExists) {
      console.log(`El archivo ${filename} ya existe, se sobreescribirá`);
    }

    // Use an empty diagram if we don't have content
    const contentToSave = !xmlContent
      ? `
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
      `
      : xmlContent;

    console.log(
      `Guardando/sobreescribiendo "${filename}" en localStorage y assets...`
    );

    // Save to localStorage
    const saveResult = saveToLocalStorage(filename, contentToSave);

    if (saveResult) {
      console.log(`Diagrama guardado como ${filename} en localStorage`);

      // Add to files list if not already there
      if (!files.includes(filename)) {
        const updatedFiles = [...files, filename];
        setFiles(updatedFiles);
      }

      // Also save to the simulated file system
      const assetResult = await saveFileToAssets(filename, contentToSave);

      if (assetResult.success) {
        console.log(`Diagrama también guardado en assets`);
      } else {
        console.warn(`No se pudo guardar en assets, pero está en localStorage`);
      }

      // Update state
      setFileName(filename);
      setCurrentFile(filename);
      setXmlContent(contentToSave);

      // Update file list
      refreshAvailableFiles();

      setShowSaveDialog(false);
      setNewFileName("");
    } else {
      console.error(`Error al guardar el diagrama: ${filename}`);
      setError("Error al crear el diagrama");
    }
  } catch (error) {
    console.error("Error en la operación Guardar Como:", error);
    setError("Error al crear el diagrama: " + (error as Error).message);
  } finally {
    setLoadingSave(false);
  }
};

/**
 * Handles file selection from the file selector
 */
export const selectFile = async (
  path: string,
  setError: (error: string | null) => void,
  setLoadingExtract: (loading: boolean) => void,
  setShowClasses: (show: boolean) => void,
  setXmlContent: (xml: string | null) => void,
  setClasses: (classes: ClassInfo[]) => void,
  setFileName: (name: string) => void,
  setCurrentFile: (name: string) => void,
  setShowFileSelector: (show: boolean) => void
): Promise<boolean> => {
  console.log(`File selected: ${path}`);
  setError(null);
  setLoadingExtract(true);
  setShowClasses(false);

  try {
    // Clear current state first
    setXmlContent(null);
    setClasses([]);

    // Get the filename from the path
    let filename = path.split("/").pop() || "";
    console.log(`Attempting to load: ${filename} from path: ${path}`);

    let content: string | null = null;

    // Check if path is from assets directory
    if (path.startsWith("/assets/")) {
      console.log(`Loading file from assets: ${filename}`);
      const result = await loadFileFromAssets(filename);

      if (result.success && result.content) {
        console.log(
          `Successfully loaded from assets, content length: ${result.content.length}`
        );
        content = result.content;
      } else {
        throw new Error(`Failed to load file from assets: ${filename}`);
      }
    } else {
      // Try loading from localStorage
      console.log(`Loading file from localStorage: ${filename}`);
      content = loadFromLocalStorage(filename);

      if (!content) {
        throw new Error(`File not found in localStorage: ${filename}`);
      }
      console.log(
        `Successfully loaded from localStorage, content length: ${content.length}`
      );
    }

    // Validate XML content
    if (
      !content ||
      (!content.includes("<mxGraphModel") && !content.includes("<mxfile"))
    ) {
      console.error(`Invalid XML content for file: ${filename}`);
      throw new Error("Invalid XML content");
    }

    // Update state with loaded content
    setXmlContent(content);
    setFileName(filename);
    setCurrentFile(filename);

    // Ensure we save the content to both localStorage and assets for consistency
    console.log(
      `Ensuring ${filename} is saved in both localStorage and assets`
    );
    saveToLocalStorage(filename, content);

    // Save to assets to ensure it's available in both places
    const assetResult = await saveFileToAssets(filename, content);
    if (assetResult.success) {
      console.log(`Archivo "${filename}" sincronizado correctamente en assets`);
    } else {
      console.warn(
        `No se pudo sincronizar "${filename}" en assets, pero está en localStorage`
      );
    }

    localStorage.setItem("lastOpenedFile", filename);

    // Close file selector
    setShowFileSelector(false);

    return true;
  } catch (error) {
    console.error("Error in handleFileSelect:", error);
    setError(`Error loading file: ${(error as Error).message}`);
    return false;
  } finally {
    setLoadingExtract(false);
  }
};

/**
 * Download the current diagram as a file
 */
export const downloadDiagram = (
  fileName: string,
  xmlContent: string | null
): void => {
  if (!xmlContent) {
    console.warn("No content to download");
    return;
  }

  downloadFile(fileName, xmlContent);
};

/**
 * Converts a class diagram to mockup
 */
export const convertDiagramToMockup = (
  xmlContent: string,
  classes: ClassInfo[],
  setError: (error: string | null) => void,
  setLoadingMockup: (loading: boolean) => void,
  setXmlContent: (content: string) => void,
  setFileName: (name: string) => void
) => {
  setLoadingMockup(true);

  try {
    // If we don't have classes, extract them first
    const classesToUse =
      classes.length > 0 ? classes : processXmlContent(xmlContent);

    // Convert to mockup XML
    const mockupXml = convertToMockup(xmlContent, classesToUse);

    // Generate a new filename
    const newFileName = `mockup_${new Date().getTime()}`;

    // Save mockup to localStorage
    saveToLocalStorage(newFileName, mockupXml);

    // Update UI with new mockup diagram
    setXmlContent(mockupXml);
    setFileName(newFileName);

    setLoadingMockup(false);
  } catch (error) {
    console.error("Error converting to mockup:", error);
    setError(
      error instanceof Error
        ? error.message
        : "Failed to convert diagram to mockup"
    );
    setLoadingMockup(false);
  }
};
