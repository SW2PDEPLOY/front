import { saveAs } from "file-saver";

// Storage key for localStorage
const STORAGE_KEY = "drawio_diagrams";

// Clase que simula un sistema de archivos local utilizando localStorage
class FileSystem {
  private static STORAGE_KEY = STORAGE_KEY;

  // Inicializa el almacenamiento si no existe
  private static initStorage() {
    if (!localStorage.getItem(FileSystem.STORAGE_KEY)) {
      localStorage.setItem(FileSystem.STORAGE_KEY, JSON.stringify({}));
    }
  }

  // Guarda un archivo en el sistema de archivos simulado
  static saveFile(path: string, content: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        FileSystem.initStorage();

        // Verificar que el contenido es una cadena
        if (typeof content !== "string") {
          console.error(
            `Error: El contenido para ${path} no es una cadena`,
            typeof content
          );
          content = String(content);
        }

        // Advertir sobre contenido SVG base64, pero no rechazarlo
        if (content.startsWith("data:image/svg+xml;base64,")) {
          console.warn(
            `Advertencia: El contenido para ${path} es SVG base64, esto podría causar problemas al procesar el diagrama`
          );
          // Verificar si contiene XML de DrawIO incrustado
          if (
            content.includes("<mxGraphModel") ||
            content.includes("<mxfile")
          ) {
            console.log(
              `El SVG parece contener XML de DrawIO incrustado, se intentará guardar`
            );
          }
        }

        // Verificar tamaño del contenido
        console.log(
          `Guardando archivo ${path}, tamaño: ${content.length} bytes`
        );

        // Validar que sea XML de DrawIO válido (mínimo)
        if (
          !content.includes("<mxGraphModel") &&
          !content.includes("<mxfile")
        ) {
          console.warn(
            `Advertencia: El contenido para ${path} no parece ser un XML de DrawIO válido`
          );
        }

        // Obtiene el almacenamiento actual
        const storage = JSON.parse(
          localStorage.getItem(FileSystem.STORAGE_KEY) || "{}"
        );

        // Guarda el archivo en el path especificado
        storage[path] = {
          content,
          lastModified: new Date().toISOString(),
        };

        // Actualiza el almacenamiento
        localStorage.setItem(FileSystem.STORAGE_KEY, JSON.stringify(storage));

        console.log(
          `Archivo guardado en: ${path}, contenido (primeros 100 caracteres): ${content.substring(
            0,
            100
          )}`
        );
        resolve(true);
      } catch (error) {
        console.error("Error al guardar el archivo:", error);
        resolve(false);
      }
    });
  }

  // Comprueba si un archivo existe
  static fileExists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        FileSystem.initStorage();

        // Obtiene el almacenamiento actual
        const storage = JSON.parse(
          localStorage.getItem(FileSystem.STORAGE_KEY) || "{}"
        );

        // Comprueba si el archivo existe
        resolve(!!storage[path]);
      } catch (error) {
        console.error("Error al comprobar si existe el archivo:", error);
        resolve(false);
      }
    });
  }

  // Lee un archivo del sistema de archivos simulado
  static readFile(path: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        FileSystem.initStorage();

        // Obtiene el almacenamiento actual
        const storage = JSON.parse(
          localStorage.getItem(FileSystem.STORAGE_KEY) || "{}"
        );

        // Lee el archivo si existe
        if (storage[path]) {
          const content = storage[path].content;
          console.log(
            `Archivo leído de ${path}, longitud: ${
              content.length
            }, primeros 100 caracteres: ${content.substring(0, 100)}`
          );

          // Verificar que el contenido sea un XML válido
          if (
            !content.includes("<mxGraphModel") &&
            !content.includes("<mxfile")
          ) {
            console.warn(
              `Advertencia: El contenido leído de ${path} no parece ser un XML de DrawIO válido`
            );
          }

          resolve(content);
        } else {
          console.log(`Archivo no encontrado: ${path}`);
          resolve(null);
        }
      } catch (error) {
        console.error("Error al leer el archivo:", error);
        resolve(null);
      }
    });
  }

  // Lista todos los archivos en el sistema de archivos simulado
  static listFiles(): Promise<{ path: string; lastModified: string }[]> {
    return new Promise((resolve) => {
      try {
        FileSystem.initStorage();

        // Obtiene el almacenamiento actual
        const storage = JSON.parse(
          localStorage.getItem(FileSystem.STORAGE_KEY) || "{}"
        );

        interface StorageFile {
          content: string;
          lastModified: string;
        }

        // Convierte el objeto en un array de archivos
        const files = Object.entries(storage).map(([path, file]) => {
          const typedFile = file as StorageFile;
          return {
            path,
            lastModified: typedFile.lastModified,
          };
        });

        resolve(files);
      } catch (error) {
        console.error("Error al listar los archivos:", error);
        resolve([]);
      }
    });
  }
}

// Funciones para interactuar con el sistema de archivos
export const saveFileToAssets = async (
  filename: string,
  content: string
): Promise<{ success: boolean; path: string }> => {
  // Construye la ruta del archivo en assets
  const path = `/assets/${filename}`;

  try {
    console.log(`Intentando guardar/sobreescribir: ${path}`);

    // Verificar si el archivo ya existe y obtener su contenido actual
    const fileExists = await FileSystem.fileExists(path);
    let currentContent = null;

    if (fileExists) {
      console.log(`El archivo ${path} ya existe, se sobreescribirá`);
      // Leer el contenido actual para posible fallback
      currentContent = await FileSystem.readFile(path);
      if (currentContent) {
        console.log(
          `Contenido actual leído, longitud: ${currentContent.length}`
        );
      }
    }

    // Extraer XML de posibles formatos especiales
    let xmlContent = content;

    // Si es un SVG con XML incrustado, intentar extraer solo el XML
    if (content.startsWith("data:image/svg+xml;base64,")) {
      console.log(
        `Recibido formato SVG base64 para ${filename}, procesando...`
      );

      try {
        // Decodificar el contenido base64
        const base64Content = content.replace("data:image/svg+xml;base64,", "");
        const decodedContent = atob(base64Content);
        console.log(`SVG decodificado, tamaño: ${decodedContent.length} bytes`);

        // Método 1: Buscar el atributo data-content que contiene el XML
        const dataContentMatch = decodedContent.match(/data-content="([^"]*)"/);
        if (dataContentMatch && dataContentMatch[1]) {
          xmlContent = decodeURIComponent(
            dataContentMatch[1].replace(/\+/g, " ")
          );
          console.log("XML extraído del atributo data-content");
        } else {
          // Método 2: Buscar etiquetas de XML directamente en el contenido
          console.log("Buscando etiquetas XML directamente en el SVG...");

          // Regex más robustas para extraer el contenido XML completo
          const xmlRegex = /<mxGraphModel[\s\S]*?<\/mxGraphModel>/;
          const mxFileRegex = /<mxfile[\s\S]*?<\/mxfile>/;

          let match =
            mxFileRegex.exec(decodedContent) || xmlRegex.exec(decodedContent);

          if (match && match[0]) {
            console.log("Extraído XML directamente del SVG");
            xmlContent = match[0];
          } else {
            // Método 3: Si tenemos contenido XML previo, usarlo como fallback
            if (
              currentContent &&
              (currentContent.includes("<mxGraphModel") ||
                currentContent.includes("<mxfile"))
            ) {
              console.log("Usando contenido XML anterior como fallback");
              xmlContent = currentContent;
            }
            // Método 4: Si parece diagrama pero no tenemos XML, crear respaldo
            else if (
              decodedContent.includes("draw.io") ||
              decodedContent.includes("diagrams.net") ||
              decodedContent.includes("mxGraph") ||
              decodedContent.includes("class")
            ) {
              console.log(
                "SVG parece ser un diagrama, guardando respaldo y manteniendo XML anterior"
              );

              // Crear un archivo de respaldo del SVG original
              const svgBackupPath = `${path}.svg.backup`;
              await FileSystem.saveFile(svgBackupPath, content);
              console.log(`Backup del SVG guardado en ${svgBackupPath}`);

              // Si no tenemos XML previo ni pudimos extraer, crear uno de fallback
              if (
                !xmlContent.includes("<mxGraphModel") &&
                !xmlContent.includes("<mxfile")
              ) {
                console.warn(
                  "No se pudo recuperar el diagrama, creando XML de error"
                );
                xmlContent = `<mxfile modified="${new Date().toISOString()}" host="app.diagrams.net" agent="SVG-Recovered">
                  <diagram id="recovered" name="Error-Recuperación">
                    <mxGraphModel>
                      <root>
                        <mxCell id="0"/>
                        <mxCell id="1" parent="0"/>
                        <mxCell id="2" value="ERROR: No se pudo recuperar el diagrama original" style="text;html=1;strokeColor=#b85450;fillColor=#f8cecc;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1" vertex="1" parent="1">
                          <mxGeometry x="10" y="10" width="400" height="30" as="geometry"/>
                        </mxCell>
                      </root>
                    </mxGraphModel>
                  </diagram>
                </mxfile>`;
              }
            } else {
              console.warn(
                "No se pudo extraer XML del SVG, guardando contenido original"
              );
            }
          }
        }
      } catch (error) {
        console.error("Error al procesar SVG base64:", error);
        // Si hay error pero tenemos XML previo, usarlo como fallback
        if (
          currentContent &&
          (currentContent.includes("<mxGraphModel") ||
            currentContent.includes("<mxfile"))
        ) {
          console.log(
            "Error procesando SVG, usando contenido anterior como fallback"
          );
          xmlContent = currentContent;
        }
      }
    }

    // Validación más flexible - advertir pero no rechazar si no parece XML de DrawIO
    if (
      !xmlContent.includes("<mxGraphModel") &&
      !xmlContent.includes("<mxfile")
    ) {
      console.warn(
        `Advertencia: El contenido para ${filename} no parece ser XML de DrawIO válido.`
      );

      // Si tenemos contenido anterior válido, usarlo en lugar del inválido
      if (
        currentContent &&
        (currentContent.includes("<mxGraphModel") ||
          currentContent.includes("<mxfile"))
      ) {
        console.log("Usando contenido XML anterior en lugar del inválido");
        xmlContent = currentContent;
      } else {
        console.warn(
          "No hay contenido válido anterior, guardando contenido actual de todos modos"
        );
      }
    }

    console.log(`Guardando ${filename}, tamaño: ${xmlContent.length}`);

    // Guarda/sobreescribe el archivo en el sistema de archivos simulado
    const saved = await FileSystem.saveFile(path, xmlContent);

    if (saved) {
      console.log(
        `Archivo ${fileExists ? "sobreescrito" : "guardado"} con éxito: ${path}`
      );
      return {
        success: true,
        path,
      };
    } else {
      throw new Error(
        `No se pudo ${
          fileExists ? "sobreescribir" : "guardar"
        } el archivo en assets`
      );
    }
  } catch (error) {
    console.error("Error al guardar en assets:", error);
    return {
      success: false,
      path,
    };
  }
};

// Función para reiniciar el almacenamiento si está corrupto
export const resetStorage = (): boolean => {
  try {
    console.log("Reiniciando almacenamiento...");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    return true;
  } catch (error) {
    console.error("Error al reiniciar almacenamiento:", error);
    return false;
  }
};

// Función para verificar y reparar el almacenamiento si es necesario
export const verifyAndRepairStorage = async (): Promise<boolean> => {
  try {
    console.log("Verificando estado del almacenamiento...");

    // Verificar si podemos acceder al almacenamiento
    const storageRaw = localStorage.getItem(STORAGE_KEY);
    if (!storageRaw) {
      console.log("Almacenamiento no inicializado, creando nuevo");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      return true;
    }

    // Verificar que podemos parsear el JSON
    try {
      const storage = JSON.parse(storageRaw);
      console.log(
        `Almacenamiento verificado, ${
          Object.keys(storage).length
        } archivos encontrados`
      );

      // Verificar y limpiar archivos corruptos
      let storageChanged = false;
      for (const [path, file] of Object.entries(storage)) {
        // @ts-ignore
        if (!file.content || typeof file.content !== "string") {
          console.warn(`Eliminando archivo corrupto: ${path}`);
          // @ts-ignore
          delete storage[path];
          storageChanged = true;
        }
        // @ts-ignore
        else if (file.content.startsWith("data:image/svg+xml;base64,")) {
          console.warn(`Eliminando archivo con contenido SVG: ${path}`);
          // @ts-ignore
          delete storage[path];
          storageChanged = true;
        }
      }

      // Guardar cambios si hubo alguno
      if (storageChanged) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
        console.log("Almacenamiento reparado");
      }

      return true;
    } catch (e) {
      console.error("Error al parsear almacenamiento, reiniciando:", e);
      resetStorage();
      return true;
    }
  } catch (error) {
    console.error("Error verificando almacenamiento:", error);
    return false;
  }
};

// Función para descargar un archivo (solo se usará cuando el usuario lo solicite explícitamente)
export const downloadFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: "application/xml" });
  saveAs(blob, filename);
};

export const checkFileExistsInAssets = async (
  filename: string
): Promise<{ exists: boolean; path: string }> => {
  const path = `/assets/${filename}`;

  try {
    const exists = await FileSystem.fileExists(path);
    return { exists, path };
  } catch (error) {
    console.error("Error al comprobar si existe el archivo:", error);
    return { exists: false, path };
  }
};

export const loadFileFromAssets = async (
  filename: string
): Promise<{ success: boolean; content: string | null }> => {
  const path = `/assets/${filename}`;

  try {
    const content = await FileSystem.readFile(path);
    return {
      success: !!content,
      content,
    };
  } catch (error) {
    console.error("Error al cargar el archivo:", error);
    return {
      success: false,
      content: null,
    };
  }
};

export const listAssetsFiles = async (): Promise<
  { path: string; lastModified: string }[]
> => {
  try {
    // Filtra solo los archivos en el directorio "assets"
    const allFiles = await FileSystem.listFiles();
    return allFiles.filter((file) => file.path.startsWith("/assets/"));
  } catch (error) {
    console.error("Error al listar los archivos:", error);
    return [];
  }
};
