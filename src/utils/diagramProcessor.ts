import { ClassInfo, ClassAttribute } from "../types/diagram";

/**
 * Extract classes and attributes from XML content
 */
export const extractClassesFromXml = (xmlContent: string): ClassInfo[] => {
  if (!xmlContent) {
    console.error("No XML content provided to extractClassesFromXml");
    return [];
  }

  try {
    console.log("Analizando XML para extracción de clases...");

    // Parse the XML string to a DOM object
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    // Pattern for swimlane classes
    const swimlanePattern =
      /<object\s+label="([^"]*)" id="[^"]*"\s*><mxCell[^>]*>[^<]*<mxGeometry[^>]*>/g;
    // More general pattern for potential classes
    const classPattern =
      /<mxCell[^>]*parent="[^"]*"[^>]*value="([^(][^"]*)"[^>]*>/g;

    let classesFound: ClassInfo[] = [];
    let match;

    // First, try to extract classes using the swimlane pattern
    const swimlaneMatches = xmlContent.match(swimlanePattern);
    if (swimlaneMatches && swimlaneMatches.length > 0) {
      // Process swimlane classes
      while ((match = swimlanePattern.exec(xmlContent)) !== null) {
        const className = match[1].trim();
        classesFound.push({ name: className, attributes: [] });
      }
    } else {
      // If no swimlane classes, try the more general pattern
      while ((match = classPattern.exec(xmlContent)) !== null) {
        const className = match[1].trim();
        classesFound.push({ name: className, attributes: [] });
      }
    }

    console.log(`Found ${classesFound.length} classes in XML`);

    // Extract attributes for each class
    classesFound = classesFound.map((cls) => {
      // Find elements with the class name as parent
      const cells = xmlDoc.querySelectorAll(`mxCell[parent="${cls.name}"]`);
      const attributes: ClassAttribute[] = [];

      cells.forEach((cell) => {
        const value = cell.getAttribute("value");
        if (value) {
          // First, clean up the attribute value by removing HTML tags
          const cleanValue = value.replace(/<[^>]*>/g, "").trim();

          // Parse visibility, name, and type from attribute
          // Updated pattern to better match visibility, name and type with colon separator
          // Format examples: +name: type, -name: type, #name:type, ~name : type, name: type, name
          const attrPattern = /^([+\-#~])?\s*([^:]+)(?:\s*:\s*(.+))?$/;

          const visibilityMap: {
            [key: string]: "public" | "private" | "protected" | "default";
          } = {
            "+": "public",
            "-": "private",
            "#": "protected",
            "~": "default",
          };

          const match = cleanValue.match(attrPattern);

          if (match) {
            const [, visibilitySymbol, name, type] = match;
            const visibility = visibilitySymbol
              ? visibilityMap[visibilitySymbol]
              : "default";

            console.log(
              `Found attribute: ${name.trim()}, type: ${
                type || "string"
              }, visibility: ${visibility}`
            );

            attributes.push({
              name: name.trim(),
              type: type ? type.trim() : "string",
              visibility,
            });
          } else {
            // If the pattern doesn't match, just use the value as name
            console.log(`Found attribute with no pattern match: ${cleanValue}`);
            attributes.push({
              name: cleanValue,
              type: "string",
              visibility: "default",
            });
          }
        }
      });

      console.log(
        `Found ${attributes.length} attributes for class ${cls.name}`
      );
      return { ...cls, attributes };
    });

    return classesFound;
  } catch (error) {
    console.error("Error extracting classes from XML:", error);
    return [];
  }
};

/**
 * Process XML content to extract class information
 */
export const processXmlContent = (xml: string): ClassInfo[] => {
  try {
    console.log(
      "Primeros 100 caracteres del XML:",
      xml.substring(0, 100) + "..."
    );
    console.log("¿El XML contiene 'mxCell'?", xml.includes("mxCell"));
    console.log("¿El XML contiene 'swimlane'?", xml.includes("swimlane"));

    // Crear un parser de DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    // Verificar errores de parsing
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      console.error("Error al parsear XML:", parserError.textContent);
      throw new Error("Error al parsear el XML");
    }

    console.log("XML parseado correctamente");

    // Enfoque 1: Buscar directamente los elementos mxCell con estilo swimlane (clases)
    const cellElements = xmlDoc.querySelectorAll("mxCell");
    console.log(`Encontrados ${cellElements.length} elementos mxCell`);

    const classInfoArray: ClassInfo[] = [];
    const classMap: Record<string, ClassInfo> = {};

    // First identify classes (swimlane elements)
    cellElements.forEach((cell) => {
      const style = cell.getAttribute("style") || "";
      const value = cell.getAttribute("value") || "";
      const id = cell.getAttribute("id") || "";

      if (style.includes("swimlane") && value.trim() !== "") {
        console.log(`Encontrada posible clase: ID=${id}, Value=${value}`);

        // Limpiar el nombre de la clase (puede contener HTML)
        let className = value.replace(/<[^>]*>/g, "").trim();

        // Intentar extraer solo el nombre si contiene otros elementos
        if (className.includes("\n")) {
          className = className.split("\n")[0].trim();
        }

        if (className) {
          const newClass: ClassInfo = {
            name: className,
            attributes: [],
          };
          classInfoArray.push(newClass);
          classMap[id] = newClass;
        }
      }
    });

    console.log(`Encontradas ${classInfoArray.length} clases`);

    // Now look for attributes (referencing a class as parent)
    cellElements.forEach((cell) => {
      const parent = cell.getAttribute("parent") || "";
      const value = cell.getAttribute("value") || "";
      const style = cell.getAttribute("style") || "";

      // Check if this cell is an attribute of a class
      if (parent && classMap[parent] && value.trim() !== "") {
        // Skip dividers or methods (contain parentheses)
        if (!value.includes("()") && !style.includes("line")) {
          // Clean up HTML tags
          const attributeName = value.replace(/<[^>]*>/g, "").trim();

          if (attributeName) {
            console.log(
              `Encontrado atributo "${attributeName}" para clase "${classMap[parent].name}"`
            );

            // Parse visibility, name, and type from attribute
            const attrPattern = /^([+\-#~])?\s*([^:]+)(?:\s*:\s*(.+))?$/;

            const visibilityMap: {
              [key: string]: "public" | "private" | "protected" | "default";
            } = {
              "+": "public",
              "-": "private",
              "#": "protected",
              "~": "default",
            };

            const match = attributeName.match(attrPattern);
            if (match) {
              const [, visibilitySymbol, name, type] = match;
              const visibility = visibilitySymbol
                ? visibilityMap[visibilitySymbol]
                : "default";

              console.log(
                `Atributo con formato detectado: ${name.trim()}, tipo: ${
                  type || "string"
                }, visibilidad: ${visibility}`
              );

              classMap[parent].attributes.push({
                name: name.trim(),
                type: type ? type.trim() : "string",
                visibility,
              });
            } else {
              // If the pattern doesn't match, just use the value as name
              classMap[parent].attributes.push({
                name: attributeName,
                type: "string",
                visibility: "default",
              });
            }
          }
        }
      }
    });

    // If no classes found with the DOM method, try with regex
    if (classInfoArray.length === 0) {
      console.log(
        "No se encontraron clases usando DOM parsing, intentando con regex"
      );
      return extractClassesUsingRegex(xml);
    }

    console.log(`Total de clases extraídas: ${classInfoArray.length}`);
    classInfoArray.forEach((c) => {
      console.log(`Clase ${c.name}: ${c.attributes.length} atributos`);
      c.attributes.forEach((attr) => {
        console.log(`  - ${attr.name}: ${attr.type} (${attr.visibility})`);
      });
    });

    return classInfoArray;
  } catch (error) {
    console.error("Error processing XML:", error);
    return [];
  }
};

/**
 * Extract classes using regex as a fallback method
 */
const extractClassesUsingRegex = (xml: string): ClassInfo[] => {
  const classInfoArray: ClassInfo[] = [];

  try {
    // Look for class patterns in raw XML
    const classRegex =
      /<mxCell[^>]*style="[^"]*swimlane[^"]*"[^>]*value="([^"]*)"[^>]*>/g;
    let classMatch;
    while ((classMatch = classRegex.exec(xml)) !== null) {
      const value = classMatch[1];
      const className = value
        .replace(/<[^>]*>/g, "")
        .split("\n")[0]
        .trim();
      if (className) {
        console.log(`Found class using regex: ${className}`);
        classInfoArray.push({
          name: className,
          attributes: [],
        });
      }
    }

    // Look for attributes (simplified with regex)
    const attrRegex =
      /<mxCell[^>]*parent="[^"]*"[^>]*value="([^(][^"]*)"[^>]*>/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(xml)) !== null) {
      const value = attrMatch[1];
      const attrName = value.replace(/<[^>]*>/g, "").trim();

      if (attrName && classInfoArray.length > 0) {
        // Parse visibility, name, and type
        const attrPattern = /^([+\-#~])?\s*([^:]+)(?:\s*:\s*(.+))?$/;
        const visibilityMap: {
          [key: string]: "public" | "private" | "protected" | "default";
        } = {
          "+": "public",
          "-": "private",
          "#": "protected",
          "~": "default",
        };

        const match = attrName.match(attrPattern);
        if (match) {
          const [, visibilitySymbol, name, type] = match;
          const visibility = visibilitySymbol
            ? visibilityMap[visibilitySymbol]
            : "default";

          // Attribute belongs to first class found (simplification)
          console.log(
            `Found attribute with pattern: ${name}, type: ${
              type || "string"
            }, visibility: ${visibility}`
          );
          if (classInfoArray.length > 0) {
            classInfoArray[0].attributes.push({
              name: name.trim(),
              type: type ? type.trim() : "string",
              visibility,
            });
          }
        } else {
          console.log(`Found attribute without pattern: ${attrName}`);
          if (classInfoArray.length > 0) {
            classInfoArray[0].attributes.push({
              name: attrName,
              type: "string",
              visibility: "default",
            });
          }
        }
      }
    }

    return classInfoArray;
  } catch (error) {
    console.error("Error extracting classes using regex:", error);
    return [];
  }
};
