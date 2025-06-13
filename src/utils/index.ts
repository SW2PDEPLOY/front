// File Manager exports
export {
  loadFilesFromLocalStorage,
  saveFilesListToLocalStorage,
  loadFromLocalStorage,
  saveToLocalStorage,
  updateAvailableFilesList,
  createEmptyDiagram,
  renameFile,
  deleteFile,
} from "./fileManager";

// Diagram Processor exports
export {
  extractClassesFromXml as extractClassesFromXmlProcessor,
  processXmlContent,
} from "./diagramProcessor";

// Diagram Events exports
export {
  handleDiagramAutoSave,
  extractXmlFromSaveEvent,
  extractXmlFromSvg,
} from "./diagramEvents";

// Diagram File Handlers exports
export {
  extractClasses,
  importFile,
  saveAsConfirm,
  selectFile,
} from "./diagramFileHandlers";

// Component Utils exports
export {
  createBlankDiagram,
  toggleFileSelector,
  loadDiagram,
} from "./componentUtils";

// Mockup Converter exports
export { convertToMockup } from "./mockupConverter";

// Mockup Utils exports
export { createEmptyMockup } from "./mockupUtils";

// Additional exports
export * from "./diagramUtils";
