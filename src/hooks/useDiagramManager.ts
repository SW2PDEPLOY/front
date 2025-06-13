import { useState, useEffect, useCallback } from "react";
import {
  // File Manager
  loadFilesFromLocalStorage,
  saveToLocalStorage,
  loadFromLocalStorage,
  updateAvailableFilesList,
  renameFile,
  deleteFile,

  // Diagram Processor
  // extractClassesFromXmlProcessor,
  // processXmlContent,

  // Diagram Events
  handleDiagramAutoSave,
  // extractXmlFromSaveEvent,

  // Diagram File Handlers
  extractClasses,
  importFile,
  // saveAsConfirm,
  selectFile,

  // Component Utils
  createBlankDiagram,
  toggleFileSelector,
  loadDiagram,
} from "../utils";
import { ClassInfo } from "../types/diagram";
import { downloadFile, listAssetsFiles } from "../services/fileService";
import { DrawIoEmbedRef } from "react-drawio";
import { diagramasApi, mockupsApi } from "../services/apiService";

// Define the DrawioAutoSaveEvent interface
interface DrawioAutoSaveEvent {
  event: "autosave";
  xml: string;
  data?: string | Record<string, unknown>;
}

export function useDiagramManager(
  drawioRef?: React.RefObject<DrawIoEmbedRef | null>
) {
  // State variables
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [showClasses, setShowClasses] = useState(false);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingMockup, setLoadingMockup] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showMockupSaveDialog, setShowMockupSaveDialog] = useState(false);
  const [mockupFileName, setMockupFileName] = useState("mockup");
  const [mockupXmlContent, setMockupXmlContent] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<
    { path: string; name: string }[]
  >([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [showDiagramManager, setShowDiagramManager] = useState(false);
  const [showImageConverter, setShowImageConverter] = useState(false);

  // Load the list of saved diagrams
  useEffect(() => {
    const filesList = updateAvailableFilesList();
    setAvailableFiles(filesList);
  }, []);

  // Load file list on component mount
  useEffect(() => {
    const savedFiles = loadFilesFromLocalStorage();
    setFiles(savedFiles);

    // Load the last opened file if available
    const lastOpenedFile = localStorage.getItem("lastOpenedFile");
    if (lastOpenedFile && savedFiles.includes(lastOpenedFile)) {
      loadFile(lastOpenedFile);
    }
  }, []);

  // Save to localStorage whenever xmlContent changes and we have a filename
  useEffect(() => {
    if (xmlContent && fileName) {
      console.log(`Saving ${fileName} after content change...`);
      saveToLocalStorage(fileName, xmlContent);
    }
  }, [xmlContent, fileName]);

  // Function to update available files list
  const refreshAvailableFiles = useCallback(() => {
    const filesList = updateAvailableFilesList();
    setAvailableFiles(filesList);

    // Update files state
    const fileNames = filesList.map((file) => file.name);
    setFiles(fileNames);
  }, []);

  // Function to create a new blank diagram
  const handleCreateNewDiagram = () => {
    createBlankDiagram(
      setXmlContent,
      setClasses,
      setShowClasses,
      setCurrentFile,
      setFileName,
      setError,
      setShowSaveDialog
    );
  };

  // Show file selector
  const handleToggleFileSelector = () => {
    toggleFileSelector(
      showFileSelector,
      setShowFileSelector,
      refreshAvailableFiles,
      listAssetsFiles,
      availableFiles,
      setAvailableFiles
    );
  };

  // Function to handle file selection from the selector
  const handleFileSelect = async (path: string) => {
    return selectFile(
      path,
      setError,
      setLoadingExtract,
      setShowClasses,
      setXmlContent,
      setClasses,
      setFileName,
      setCurrentFile,
      setShowFileSelector
    );
  };

  // Handler for the class extraction button
  const handleExtractClasses = () => {
    if (xmlContent) {
      extractClasses(
        xmlContent,
        setError,
        setLoadingExtract,
        setClasses,
        setShowClasses
      );
    } else {
      console.error("No hay contenido XML para procesar");
      setError("No hay contenido XML para procesar");
    }
  };

  // Function to import a file from the user's local system
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    importFile(
      file,
      setError,
      setXmlContent,
      setFileName,
      setCurrentFile,
      refreshAvailableFiles
    );

    // Clear the input to allow selecting the same file again
    event.target.value = "";
  };

  // Handle save dialog confirmation
  const handleSaveAsConfirm = async (): Promise<string | null> => {
    if (!newFileName || newFileName.trim() === "") {
      setError("Error: Debe ingresar un nombre para el archivo");
      return null;
    }

    setLoadingSave(true);
    let createdDiagramId: string | null = null;

    try {
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

      console.log(`Guardando/sobreescribiendo "${filename}" en localStorage y API...`);

      // Save to localStorage for offline access
      const saveResult = saveToLocalStorage(filename, contentToSave);

      if (saveResult) {
        try {
          // Also save to the API
          const nameWithoutExt = filename.replace(/\.drawio\.xml$/, "");
          const apiResponse = await diagramasApi.create({
            nombre: nameWithoutExt,
            xml: contentToSave,
          });
          
          console.log("Diagrama guardado en API:", apiResponse);
          // Guardar el ID del diagrama creado
          createdDiagramId = apiResponse.id;
        } catch (apiError) {
          console.error("Error guardando en API, pero guardado localmente:", apiError);
        }

        console.log(`Diagrama guardado como ${filename} en localStorage`);

        // Add to files list if not already there
        if (!files.includes(filename)) {
          const updatedFiles = [...files, filename];
          setFiles(updatedFiles);
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

    return createdDiagramId;
  };

  // Download the current diagram as a file
  const handleDownload = () => {
    if (!xmlContent) return;
    downloadFile(fileName, xmlContent);
  };

  // Function to load a file
  const loadFile = (fileName: string) => {
    loadDiagram(fileName, setXmlContent, setCurrentFile, setError);
  };

  // Handler for onAutoSave event
  const handleAutoSave = (data: DrawioAutoSaveEvent) => {
    handleDiagramAutoSave(
      data,
      fileName,
      files,
      setFiles,
      refreshAvailableFiles,
      setXmlContent
    );
  };

  // Handler for exporting XML from drawio
  const handleExportXml = useCallback(() => {
    console.log("Manually triggering PNG export from diagram");
    if (drawioRef?.current) {
      // Export as PNG but don't save the content to the current diagram
      const originalXmlContent = xmlContent;

      // Use exportDiagram which will trigger the onExport handler
      drawioRef.current.exportDiagram({
        format: "png",
      });

      // Make sure we preserve the original XML content (will run after the export callback)
      setTimeout(() => {
        if (originalXmlContent !== xmlContent) {
          console.log("Restoring original XML content after export");
          setXmlContent(originalXmlContent);
        }
      }, 100);
    } else {
      setError(
        "No se puede exportar el diagrama: el editor no está inicializado"
      );
    }
  }, [drawioRef, xmlContent]);

  // Handler for the mockup conversion button
  const handleConvertToMockup = () => {
    if (xmlContent) {
      try {
        setLoadingMockup(true);
        console.log("Iniciando conversión a mockup...");
        
        // Verificar primero si el XML es válido
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
          if (xmlDoc.querySelector("parsererror")) {
            throw new Error("El XML del diagrama no es válido");
          }
        } catch (parseError) {
          console.error("Error al validar el XML del diagrama:", parseError);
          setError("El XML del diagrama no es válido para la conversión");
          setLoadingMockup(false);
          return;
        }

        // Import the processXmlContent function directly from diagramProcessor
        import("../utils/diagramProcessor").then(({ processXmlContent }) => {
          try {
            // Extract classes from the XML
            const extractedClasses = processXmlContent(xmlContent);
            console.log(`Clases extraídas: ${extractedClasses.length}`);
            
            if (extractedClasses.length === 0) {
              console.warn("No se encontraron clases en el diagrama");
            }

            // Import the converter and generate mockup
            import("../utils/mockupConverter").then(({ convertToMockup }) => {
              try {
                // Convert to mockup
                const mockupXml = convertToMockup(xmlContent, extractedClasses);
                console.log("Mockup generado correctamente");
                
                // Verificar que el mockup generado sea válido
                try {
                  const parser = new DOMParser();
                  const mockupDoc = parser.parseFromString(mockupXml, "text/xml");
                  if (mockupDoc.querySelector("parsererror")) {
                    throw new Error("El mockup generado no es válido");
                  }
                } catch (validationError) {
                  console.error("Error validando mockup generado:", validationError);
                  setError("Error al generar el mockup: formato XML inválido");
                  setLoadingMockup(false);
                  return;
                }

                // Store the mockup XML for saving
                setMockupXmlContent(mockupXml);

                // Set a default name based on original file
                const baseName = fileName.replace(/\.drawio\.xml$/, "");
                setMockupFileName(`mockup_${baseName || "nuevo"}`);

                // Show the save dialog
                setShowMockupSaveDialog(true);
                setLoadingMockup(false);
              } catch (conversionError) {
                console.error("Error en la conversión a mockup:", conversionError);
                setError(`Error al convertir a mockup: ${conversionError instanceof Error ? conversionError.message : "Error desconocido"}`);
                setLoadingMockup(false);
              }
            }).catch(importError => {
              console.error("Error al importar el convertidor:", importError);
              setError("Error al cargar el convertidor de mockups");
              setLoadingMockup(false);
            });
          } catch (processingError) {
            console.error("Error al procesar el XML:", processingError);
            setError(`Error al procesar el diagrama: ${processingError instanceof Error ? processingError.message : "Error desconocido"}`);
            setLoadingMockup(false);
          }
        }).catch(importError => {
          console.error("Error al importar el procesador:", importError);
          setError("Error al cargar el procesador de diagramas");
          setLoadingMockup(false);
        });
      } catch (error) {
        console.error("Error preparing mockup conversion:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to prepare mockup conversion"
        );
        setLoadingMockup(false);
      }
    } else {
      console.error("No hay contenido XML para procesar");
      setError("No hay contenido XML para procesar");
    }
  };

  // Handle mockup save dialog confirmation
  const handleMockupSaveConfirm = async (): Promise<string | null> => {
    // Usar el contenido actual si no hay mockupXmlContent específico
    // Este es el caso cuando se crea un nuevo mockup desde la página NewMockupPage
    const contentToSave = mockupXmlContent || xmlContent;
    
    if (!contentToSave) {
      setError("No hay contenido de mockup para guardar");
      return null;
    }

    setLoadingSave(true);
    let createdMockupId: string | null = null;

    try {
      // Ensure the filename has the correct extension
      let filename = mockupFileName;
      if (!filename.endsWith(".drawio.xml")) {
        filename = filename.endsWith(".xml")
          ? filename.replace(".xml", ".drawio.xml")
          : `${filename}.drawio.xml`;
      }

      // Save mockup to localStorage
      const saveResult = saveToLocalStorage(filename, contentToSave);

      if (saveResult) {
        try {
          // Also save to the API
          const nameWithoutExt = filename.replace(/\.drawio\.xml$/, "");
          const apiResponse = await mockupsApi.create({
            nombre: nameWithoutExt,
            xml: contentToSave,
          });
          
          console.log("Mockup guardado en API:", apiResponse);
          // Guardar el ID del mockup creado
          createdMockupId = apiResponse.id;
        } catch (apiError) {
          console.error("Error guardando mockup en API, pero guardado localmente:", apiError);
        }

        // Update UI with new mockup diagram
        setXmlContent(contentToSave);
        setFileName(filename);
        setCurrentFile(filename);

        // Add to files list if not already there
        if (!files.includes(filename)) {
          const updatedFiles = [...files, filename];
          setFiles(updatedFiles);
        }

        // Update file list
        refreshAvailableFiles();

        // Close dialog
        setShowMockupSaveDialog(false);
        setMockupFileName("mockup");
        setMockupXmlContent(null);
      } else {
        setError("Error al guardar el mockup");
      }
    } catch (error) {
      console.error("Error saving mockup:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save mockup"
      );
    } finally {
      setLoadingSave(false);
    }

    return createdMockupId;
  };

  // Toggle diagram manager
  const handleToggleDiagramManager = () => {
    setShowDiagramManager(!showDiagramManager);

    // Refresh file list when opening
    if (!showDiagramManager) {
      refreshAvailableFiles();
    }
  };

  // Rename a diagram file
  const handleRenameDiagram = async (
    oldName: string,
    newName: string
  ): Promise<boolean> => {
    try {
      if (oldName === newName) {
        return true; // No change needed
      }

      // Check if new name already exists
      if (files.includes(newName)) {
        setError(`Ya existe un diagrama con el nombre "${newName}"`);
        return false;
      }

      const success = renameFile(oldName, newName);

      if (success) {
        // Update current file name if it's the one being renamed
        if (currentFile === oldName) {
          setFileName(newName);
          setCurrentFile(newName);
        }

        // Update files list
        const updatedFiles = files.map((f) => (f === oldName ? newName : f));
        setFiles(updatedFiles);
        refreshAvailableFiles();
      }

      return success;
    } catch (error) {
      console.error("Error renaming diagram:", error);
      setError("Error al renombrar el diagrama");
      return false;
    }
  };

  // Delete a diagram file
  const handleDeleteDiagram = async (fileName: string): Promise<boolean> => {
    try {
      const success = deleteFile(fileName);

      if (success) {
        // If the current file is being deleted, clear the current state
        if (currentFile === fileName) {
          setXmlContent(null);
          setFileName("");
          setCurrentFile("");
          setClasses([]);
        }

        // Update files list
        const updatedFiles = files.filter((f) => f !== fileName);
        setFiles(updatedFiles);
        refreshAvailableFiles();
      }

      return success;
    } catch (error) {
      console.error("Error deleting diagram:", error);
      setError("Error al eliminar el diagrama");
      return false;
    }
  };

  // Toggle image mockup converter
  const handleToggleImageConverter = () => {
    setShowImageConverter(!showImageConverter);
  };

  // Handle mockup generated from image
  const handleImageMockupGenerated = (xmlContent: string) => {
    try {
      // Generate a filename based on timestamp
      const timestamp = new Date().getTime();
      const filename = `image_mockup_${timestamp}.drawio.xml`;

      // Save to localStorage
      const saveResult = saveToLocalStorage(filename, xmlContent);

      if (saveResult) {
        // Also save to the API
        try {
          const nameWithoutExt = filename.replace(/\.drawio\.xml$/, "");
          mockupsApi.create({
            nombre: nameWithoutExt,
            xml: xmlContent,
          }).then(response => {
            console.log("Mockup de imagen guardado en API:", response);
          });
        } catch (apiError) {
          console.error("Error guardando mockup de imagen en API, pero guardado localmente:", apiError);
        }

        // Update UI with new mockup
        setXmlContent(xmlContent);
        setFileName(filename);
        setCurrentFile(filename);

        // Add to files list if not already there
        if (!files.includes(filename)) {
          const updatedFiles = [...files, filename];
          setFiles(updatedFiles);
        }

        // Update file list
        refreshAvailableFiles();

        // Close dialog
        setShowImageConverter(false);
      } else {
        setError("Error al guardar el mockup generado desde imagen");
      }
    } catch (error) {
      console.error("Error saving image mockup:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save image mockup"
      );
    }
  };

  return {
    // State
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
    showDiagramManager,
    showImageConverter,
    availableFiles,
    showFileSelector,
    files,
    currentFile,

    // State setters
    setXmlContent,
    setError,
    setShowClasses,
    setShowSaveDialog,
    setNewFileName,
    setShowMockupSaveDialog,
    setMockupFileName,
    setShowDiagramManager,
    setShowImageConverter,

    // Handlers
    handleCreateNewDiagram,
    handleToggleFileSelector,
    handleToggleDiagramManager,
    handleToggleImageConverter,
    handleImageMockupGenerated,
    handleFileSelect,
    handleExtractClasses,
    handleConvertToMockup,
    handleMockupSaveConfirm,
    handleRenameDiagram,
    handleDeleteDiagram,
    handleFileImport,
    handleSaveAsConfirm,
    handleDownload,
    handleAutoSave,
    handleExportXml,
  };
}
