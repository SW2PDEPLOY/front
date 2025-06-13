import { ClassInfo } from "../types/diagram";
import { createEmptyMockup } from "./mockupUtils";

/**
 * Convierte un diagrama de clases a un mockup
 * Cada clase se convierte en una tabla en el mockup
 */
export const convertToMockup = (
  xmlContent: string,
  classes: ClassInfo[]
): string => {
  // Si no tenemos clases, intentamos extraerlas del XML
  if (!classes.length && xmlContent) {
    try {
      console.log("No hay clases proporcionadas, intentando extraerlas del XML...");
      const parser = new DOMParser();
      
      // Verificar primero si el XML es válido
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      if (xmlDoc.querySelector("parsererror")) {
        console.error("El XML de entrada no es válido");
        // Devolver un mockup vacío si el XML no es válido
        return createEmptyMockup();
      }

      // Crear un nuevo diagrama desde cero basado en las clases encontradas
      const mockupXml = generateMockupXml(classes);
      
      // Asegurar que no hay problemas con la codificación
      try {
        // Verificar que el XML resultante sea válido para evitar problemas con atob()
        const validationDoc = parser.parseFromString(mockupXml, "text/xml");
        if (validationDoc.querySelector("parsererror")) {
          console.error("El XML generado no es válido");
          return createEmptyMockup();
        }
      } catch (validationError) {
        console.error("Error de validación:", validationError);
        return createEmptyMockup();
      }
      
      return mockupXml;
    } catch (error) {
      console.error("Error convirtiendo a mockup:", error);
      // En caso de error, devolver un mockup vacío
      return createEmptyMockup();
    }
  } else {
    // Usar las clases proporcionadas
    try {
      // Generar el mockup con las clases proporcionadas
      const mockupXml = generateMockupXml(classes);
      
      // Verificar que el resultado sea válido
      const parser = new DOMParser();
      try {
        const validationDoc = parser.parseFromString(mockupXml, "text/xml");
        if (validationDoc.querySelector("parsererror")) {
          console.error("El XML generado con clases proporcionadas no es válido");
          return createEmptyMockup();
        }
      } catch (validationError) {
        console.error("Error de validación con clases proporcionadas:", validationError);
        return createEmptyMockup();
      }
      
      return mockupXml;
    } catch (error) {
      console.error("Error generando mockup:", error);
      return createEmptyMockup();
    }
  }
};

/**
 * Genera el XML del mockup basado en las clases extraídas
 */
const generateMockupXml = (classes: ClassInfo[]): string => {
  if (!classes.length) {
    // Si no hay clases, devolver un mockup vacío usando la función de mockupUtils
    return createEmptyMockup();
  }

  try {
    // Como es difícil manipular directamente el XML/SVG, vamos a hacerlo de otra manera
    // Crearemos un contenido modificado a partir del template
    const baseMockup = createEmptyMockup();
    
    // Asegurar que el XML base es válido
    try {
      // Verificar si el XML se puede parsear correctamente
      const parser = new DOMParser();
      const doc = parser.parseFromString(baseMockup, "text/xml");
      if (doc.querySelector("parsererror")) {
        console.error("El XML base no es válido");
        return createEmptyMockup();
      }
    } catch (parseError) {
      console.error("Error al validar el XML base:", parseError);
      return createEmptyMockup();
    }
    
    // Eliminar la tabla predeterminada y el título
    let modifiedMockup = baseMockup;
    
    // Buscar y quitar el header-title
    const headerTitleStart = modifiedMockup.indexOf('<mxCell id="header-title"');
    if (headerTitleStart !== -1) {
      const headerTitleEnd = modifiedMockup.indexOf('</mxCell>', headerTitleStart) + 8;
      modifiedMockup = modifiedMockup.substring(0, headerTitleStart) + modifiedMockup.substring(headerTitleEnd);
    }
    
    // Buscar y quitar el create-button
    const createButtonStart = modifiedMockup.indexOf('<mxCell id="create-button"');
    if (createButtonStart !== -1) {
      const createButtonEnd = modifiedMockup.indexOf('</mxCell>', createButtonStart) + 8;
      modifiedMockup = modifiedMockup.substring(0, createButtonStart) + modifiedMockup.substring(createButtonEnd);
    }
    
    // Buscar y quitar la tabla
    const tableStart = modifiedMockup.indexOf('<mxCell id="table"');
    if (tableStart !== -1) {
      const tableEnd = modifiedMockup.indexOf('</mxCell>', tableStart);
      // Encontrar el final real de la tabla, que puede contener muchas celdas anidadas
      let nestedLevel = 1;
      let searchPos = tableEnd + 8; // +8 para saltar el primer </mxCell>
      
      while (nestedLevel > 0 && searchPos < modifiedMockup.length) {
        const nextCloseTag = modifiedMockup.indexOf('</mxCell>', searchPos);
        const nextOpenTag = modifiedMockup.indexOf('<mxCell', searchPos);
        
        if (nextCloseTag === -1) break;
        
        if (nextOpenTag !== -1 && nextOpenTag < nextCloseTag) {
          nestedLevel++;
          searchPos = nextOpenTag + 1;
        } else {
          nestedLevel--;
          searchPos = nextCloseTag + 8;
        }
      }
      
      modifiedMockup = modifiedMockup.substring(0, tableStart) + modifiedMockup.substring(searchPos);
    }
    
    // Buscar y quitar el botón save-button
    const saveButtonStart = modifiedMockup.indexOf('<mxCell id="save-button"');
    if (saveButtonStart !== -1) {
      const saveButtonEnd = modifiedMockup.indexOf('</mxCell>', saveButtonStart) + 8;
      modifiedMockup = modifiedMockup.substring(0, saveButtonStart) + modifiedMockup.substring(saveButtonEnd);
    }
    
    // Encontrar dónde termina el root para insertar nuestras tablas antes
    const rootEndIndex = modifiedMockup.lastIndexOf('</root>');
    
    if (rootEndIndex === -1) {
      console.error("No se encontró la etiqueta de cierre </root>");
      return baseMockup;
    }
    
    // Crear el contenido HTML de todas las tablas
    let allTablesHtml = '';
    
    classes.forEach((classInfo, index) => {
      try {
        allTablesHtml += createTableForClass(classInfo, index, classes);
      } catch (error) {
        console.error(`Error al crear tabla para la clase ${classInfo.name}:`, error);
        // Continuar con la siguiente clase si hay error
      }
    });
    
    // Insertar las tablas en el XML base modificado
    modifiedMockup = 
      modifiedMockup.substring(0, rootEndIndex) + 
      allTablesHtml + 
      modifiedMockup.substring(rootEndIndex);
    
    // Verificar que el XML resultante sea válido
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(modifiedMockup, "text/xml");
      if (doc.querySelector("parsererror")) {
        console.error("El XML generado no es válido");
        return baseMockup;
      }
    } catch (parseError) {
      console.error("Error al validar el XML generado:", parseError);
      return baseMockup;
    }
    
    return modifiedMockup;
  } catch (error) {
    console.error("Error generando el XML del mockup:", error);
    // En caso de error, devolver el template base sin modificaciones
    return createEmptyMockup();
  }
};

/**
 * Crea una tabla para una clase específica dentro de una ventana de navegador web con sidebar
 */
const createTableForClass = (classInfo: ClassInfo, index: number, allClasses: ClassInfo[] = []): string => {
  const yOffset = index * 650 + 50; // Mayor espaciado vertical entre ventanas
  const windowWidth = 800;
  const windowHeight = 500;
  const sidebarWidth = 150;
  const contentWidth = windowWidth - sidebarWidth - 20; // 20 de margen
  
  // Crear una ventana de navegador web simplificada usando el formato correcto
  let tableHtml = `
    <!-- Ventana de navegador para ${classInfo.name} -->
    <mxCell id="browser-${index}" value="" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.containers.browserWindow;rSize=0;strokeColor=#666666;strokeColor2=#008cff;strokeColor3=#c4c4c4;mainText=,;recursiveResize=0;" parent="1" vertex="1">
      <mxGeometry x="50" y="${yOffset}" width="${windowWidth}" height="${windowHeight}" as="geometry"/>
    </mxCell>
    
    <!-- Título de la ventana del navegador (corregido) -->
    <mxCell id="browser-${index}-title" value="${classInfo.name}" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.containers.anchor;fontSize=17;fontColor=#666666;align=left;" parent="browser-${index}" vertex="1">
      <mxGeometry x="60" y="12" width="110" height="26" as="geometry"/>
    </mxCell>
    
    <!-- URL del navegador (corregido) -->
    <mxCell id="browser-${index}-url" value="https://www.${classInfo.name.toLowerCase()}.io" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.containers.anchor;rSize=0;fontSize=17;fontColor=#666666;align=left;" parent="browser-${index}" vertex="1">
      <mxGeometry x="130" y="60" width="250" height="26" as="geometry"/>
    </mxCell>
    
    <!-- Sidebar -->
    <mxCell id="sidebar-${index}" value="" style="shape=mxgraph.mockup.containers.marginRect;html=1;" parent="browser-${index}" vertex="1">
      <mxGeometry x="10" y="110" width="${sidebarWidth}" height="${windowHeight-120}" as="geometry"/>
    </mxCell>
    
    <!-- Título del sidebar -->
    <mxCell id="sidebar-title-${index}" value="Clases" style="text;html=1;align=center;" parent="sidebar-${index}" vertex="1">
      <mxGeometry x="10" y="10" width="${sidebarWidth-20}" height="30" as="geometry"/>
    </mxCell>`;

  // Añadir enlaces a todas las clases en el sidebar usando nombres reales de clases
  for (let i = 0; i < Math.min(5, allClasses.length); i++) {
    const className = allClasses[i]?.name || `Clase ${i+1}`;
    tableHtml += `
    
    <!-- Enlace clase ${i} -->
    <mxCell id="sidebar-link-${index}-${i}" value="${className}" style="text;html=1;" parent="sidebar-${index}" vertex="1">
      <mxGeometry x="20" y="${50 + i * 30}" width="${sidebarWidth-40}" height="20" as="geometry"/>
    </mxCell>`;
  }
  
  // Añadir botón de salir
  tableHtml += `
    
    <!-- Botón Salir -->
    <mxCell id="sidebar-exit-${index}" value="Salir" style="text;html=1;fontStyle=1;align=center;" parent="sidebar-${index}" vertex="1">
      <mxGeometry x="20" y="${windowHeight-190}" width="${sidebarWidth-40}" height="30" as="geometry"/>
    </mxCell>
    
    <!-- Contenido principal -->
    <mxCell id="content-${index}" value="" style="shape=mxgraph.mockup.containers.marginRect;html=1;" parent="browser-${index}" vertex="1">
      <mxGeometry x="${sidebarWidth+10}" y="110" width="${contentWidth}" height="${windowHeight-120}" as="geometry"/>
    </mxCell>
    
    <!-- Título del contenido -->
    <mxCell id="content-title-${index}" value="Listado de ${classInfo.name}" style="text;html=1;align=center;fontStyle=1;fontSize=16;" parent="content-${index}" vertex="1">
      <mxGeometry x="10" y="10" width="${contentWidth-20}" height="30" as="geometry"/>
    </mxCell>
    
    <!-- Botón Crear corregido -->
    <mxCell id="content-create-button-${index}" parent="content-${index}" vertex="1">
      <mxGeometry x="10" y="50" width="80" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="content-create-text-${index}" value="+ Crear" style="text;html=1;align=center;fontStyle=1;" parent="content-create-button-${index}" vertex="1">
      <mxGeometry width="80" height="30" as="geometry"/>
    </mxCell>
    
    <!-- Tabla de datos -->
    <mxCell id="data-container-${index}" value="" style="shape=mxgraph.mockup.containers.marginRect;html=1;" parent="content-${index}" vertex="1">
      <mxGeometry x="10" y="90" width="${contentWidth-20}" height="${windowHeight-240}" as="geometry"/>
    </mxCell>`;
  
  // Añadir encabezados de tabla
  tableHtml += `
    
    <!-- Encabezados de tabla -->
    <mxCell id="header-row-${index}" value="" style="shape=mxgraph.mockup.containers.rrect;html=1;fillColor=#ddeeff;" parent="data-container-${index}" vertex="1">
      <mxGeometry x="0" y="0" width="${contentWidth-20}" height="30" as="geometry"/>
    </mxCell>
    
    <!-- Encabezado ID -->
    <mxCell id="header-id-${index}" value="ID" style="text;html=1;align=center;" parent="header-row-${index}" vertex="1">
      <mxGeometry width="40" height="30" as="geometry"/>
    </mxCell>`;
  
  // Añadir encabezados para los atributos
  const maxAttrs = Math.min(classInfo.attributes.length, 4); // Limitamos a 4 para que quepa mejor
  const colWidth = Math.floor((contentWidth - 20 - 40 - 100) / maxAttrs); // Ancho menos margen, ID y Acciones
  
  for (let i = 0; i < maxAttrs; i++) {
    const attr = classInfo.attributes[i];
    tableHtml += `
    
    <!-- Encabezado ${attr.name} -->
    <mxCell id="header-attr-${index}-${i}" value="${attr.name}" style="text;html=1;align=center;" parent="header-row-${index}" vertex="1">
      <mxGeometry x="${40 + i * colWidth}" width="${colWidth}" height="30" as="geometry"/>
    </mxCell>`;
  }
  
  // Añadir encabezado de acciones
  tableHtml += `
    
    <!-- Encabezado Acciones -->
    <mxCell id="header-actions-${index}" value="Acciones" style="text;html=1;align=center;" parent="header-row-${index}" vertex="1">
      <mxGeometry x="${40 + maxAttrs * colWidth}" width="100" height="30" as="geometry"/>
    </mxCell>`;
  
  // Añadir filas de datos (3 filas)
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    const rowColor = rowIndex % 2 === 0 ? "fillColor=#f8f8f8;" : "";
    
    tableHtml += `
    
    <!-- Fila ${rowIndex+1} -->
    <mxCell id="row-${index}-${rowIndex}" value="" style="shape=mxgraph.mockup.containers.rrect;html=1;${rowColor}" parent="data-container-${index}" vertex="1">
      <mxGeometry x="0" y="${30 + rowIndex * 30}" width="${contentWidth-20}" height="30" as="geometry"/>
    </mxCell>
    
    <!-- Celda ID -->
    <mxCell id="cell-id-${index}-${rowIndex}" value="${rowIndex + 1}" style="text;html=1;align=center;" parent="row-${index}-${rowIndex}" vertex="1">
      <mxGeometry width="40" height="30" as="geometry"/>
    </mxCell>`;
    
    // Añadir celdas para cada atributo
    for (let i = 0; i < maxAttrs; i++) {
      // Valores de ejemplo
      let exampleValue = `Valor ${i+1}`;
      
      tableHtml += `
    
    <!-- Celda atributo ${i+1} -->
    <mxCell id="cell-attr-${index}-${rowIndex}-${i}" value="${exampleValue}" style="text;html=1;align=center;" parent="row-${index}-${rowIndex}" vertex="1">
      <mxGeometry x="${40 + i * colWidth}" width="${colWidth}" height="30" as="geometry"/>
    </mxCell>`;
    }
    
    // Celda de acciones con texto "Editar / Eliminar"
    tableHtml += `
    
    <!-- Celda acciones -->
    <mxCell id="cell-actions-${index}-${rowIndex}" value="Editar / Eliminar" style="text;html=1;align=center;" parent="row-${index}-${rowIndex}" vertex="1">
      <mxGeometry x="${40 + maxAttrs * colWidth}" width="100" height="30" as="geometry"/>
    </mxCell>`;
  }
  
  // Botón guardar corregido
  tableHtml += `
    
    <!-- Botón Guardar corregido -->
    <mxCell id="save-button-container-${index}" parent="content-${index}" vertex="1">
      <mxGeometry x="${(contentWidth-20)/2 - 50}" y="${windowHeight-170}" width="100" height="30" as="geometry"/>
    </mxCell>
    <mxCell id="save-button-text-${index}" value="Guardar" style="text;html=1;align=center;fontStyle=1;" parent="save-button-container-${index}" vertex="1">
      <mxGeometry width="100" height="30" as="geometry"/>
    </mxCell>`;
  
  return tableHtml;
};

/**
 * Determina el tipo de campo apropiado basado en el atributo
 */
// const getFieldTypeFromAttribute = (attr: ClassAttribute): string => {
//   const typeLower = attr.type.toLowerCase();

//   if (typeLower.includes("date") || typeLower.includes("time")) {
//     return "date";
//   } else if (
//     typeLower.includes("number") ||
//     typeLower === "int" ||
//     typeLower === "integer" ||
//     typeLower === "float" ||
//     typeLower === "double"
//   ) {
//     return "number";
//   } else if (typeLower.includes("email")) {
//     return "email";
//   } else if (typeLower.includes("password")) {
//     return "password";
//   } else if (typeLower.includes("phone") || typeLower.includes("tel")) {
//     return "tel";
//   } else if (typeLower.includes("bool")) {
//     return "checkbox";
//   } else {
//     return "text";
//   }
// };
