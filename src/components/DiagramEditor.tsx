import { forwardRef } from 'react';
import { DrawIoEmbed, DrawIoEmbedRef } from 'react-drawio';
import * as DiagramEvents from '../utils/diagramEvents';
import * as FileManager from '../utils/fileManager';
import { saveFileToAssets } from '../services/fileService';

// Define interfaces for event data
interface DrawioEventBase {
  event: string;
  xml?: string;
  data?: string | Record<string, unknown>;
}

interface DrawioSaveEvent extends DrawioEventBase {
  event: 'save';
  xml: string;
}

interface DrawioExportEvent {
  format: string;
  data: string;
}

interface DrawioAutoSaveEvent extends DrawioEventBase {
  event: 'autosave';
  xml: string;
}

// Use union type for all possible events
// type DrawioEvent = DrawioSaveEvent | DrawioAutoSaveEvent;

interface DiagramEditorProps {
  xmlContent: string;
  fileName: string;
  currentFile: string;
  files: string[];
  onAutoSave: (data: DrawioAutoSaveEvent) => void;
  setXmlContent: (xml: string) => void;
}

export const DiagramEditor = forwardRef<DrawIoEmbedRef, DiagramEditorProps>(({
  xmlContent,
  fileName,
  currentFile,
  files,
  onAutoSave,
  setXmlContent
}, ref) => {
  return (
    <DrawIoEmbed
      ref={ref}
      xml={xmlContent}
      autosave={true}
      key={currentFile || 'new-diagram'}
      onExport={(data: DrawioExportEvent) => {
        console.log("Export event triggered", { format: data.format, dataLength: data.data?.length });

        if (data.format === "png" && data.data) {
          // Generate a filename for the PNG export
          let exportFilename = fileName || 'diagram';
          exportFilename = exportFilename.replace('.drawio.xml', '').replace('.xml', '') + '.png';

          // Download the PNG data directly
          console.log(`Downloading PNG as ${exportFilename}`);

          // Use a download link to trigger the browser download
          const link = document.createElement('a');
          link.href = data.data;
          link.download = exportFilename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Prevent the save action from processing this PNG data as a new diagram content
          // by not calling setXmlContent here
        }
      }}
      onSave={(e: DrawioSaveEvent) => {
        // Check if this is an image export event (we should skip saving in this case)
        const isImageExportEvent = e.xml &&
          typeof e.xml === 'string' &&
          (e.xml.startsWith('data:image/svg+xml;base64,') ||
            e.xml.startsWith('data:image/png;base64,')) &&
          e.event === 'save';

        if (isImageExportEvent) {
          console.log("Ignoring save event triggered by image export");
          return;
        }

        console.log("Save event triggered, processing event data:", {
          eventType: e.event,
          hasXml: !!e.xml,
          xmlLength: e.xml?.length || 0,
          xmlFormat: e.xml?.startsWith('data:image/svg+xml;base64,') ? 'svg-base64' :
            (e.xml?.includes('<mxGraphModel') || e.xml?.includes('<mxfile')) ? 'xml' : 'unknown',
          hasData: !!e.data,
          dataType: e.data ? typeof e.data : 'none'
        });

        const extractedXml = DiagramEvents.extractXmlFromSaveEvent(e);

        if (extractedXml) {
          console.log(`Successfully extracted XML content, length: ${extractedXml.length}, first 100 chars: ${extractedXml.substring(0, 100)}`);
          setXmlContent(extractedXml);

          if (fileName) {
            console.log(`Explicitly saving ${fileName} after save event`);
            const saveResult = FileManager.saveToLocalStorage(fileName, extractedXml);
            console.log(`Save to localStorage result: ${saveResult ? 'success' : 'failed'}`);

            // Also save to assets for persistence
            saveFileToAssets(fileName, extractedXml)
              .then(result => {
                if (result.success) {
                  console.log(`Successfully saved to assets: ${result.path}`);
                } else {
                  console.warn(`Failed to save to assets`);
                }
              })
              .catch(error => {
                console.error("Error saving to assets:", error);
              });
          } else {
            console.warn("No filename set, can't save after extraction. Current state:", {
              currentFile,
              filesCount: files.length
            });
          }
        } else {
          console.warn("Failed to extract XML content from save event. Attempting fallback extraction...");

          // Fallback: Try to extract directly if extractXmlFromSaveEvent failed
          let fallbackXml = null;

          if (e.xml && typeof e.xml === 'string') {
            console.log("Using direct event.xml content as fallback");
            fallbackXml = e.xml;
          } else if (e.data) {
            console.log("Attempting to extract from event.data as fallback");
            const dataStr = typeof e.data === 'string' ? e.data :
              (typeof e.data === 'object' && e.data.toString) ? e.data.toString() : null;

            if (dataStr) {
              // Try to find XML content in the data string
              if (dataStr.includes('<mxGraphModel') || dataStr.includes('<mxfile>')) {
                console.log("Found XML markers in event.data");
                fallbackXml = dataStr;
              }
            }
          }

          if (fallbackXml && fileName) {
            console.log(`Using fallback XML (${fallbackXml.length} chars) to save`);
            setXmlContent(fallbackXml);
            FileManager.saveToLocalStorage(fileName, fallbackXml);
          } else {
            console.error("All extraction attempts failed, cannot save diagram");
          }
        }
      }}
      onAutoSave={onAutoSave}
      urlParameters={{
        libraries: true,
        saveAndExit: true,
        noSaveBtn: false,
        noExitBtn: false,
        ui: 'kennedy'
      }}
      configuration={{
        plugins: ['uml'],
        defaultLibraries: 'uml',
        formatXml: true,
        simpleLabels: true,
        saveFormat: 'xml',
        autoSave: true,
        isNew: !currentFile
      }}
      baseUrl="https://embed.diagrams.net"
    />
  );
}); 