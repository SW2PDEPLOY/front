# Aplicación de Diagramas UML y Mockups

Este proyecto es una aplicación web para crear, gestionar y convertir diagramas UML y mockups, con funcionalidades de exportación de código Angular.

## Tecnologías Utilizadas

- React 19 con TypeScript
- Vite como bundler
- Tailwind CSS para estilos
- Axios para peticiones HTTP
- React Router para navegación
- react-drawio para el editor de diagramas

## Requisitos Previos

- Node.js 18 o superior
- npm 8 o superior
- Docker y Docker Compose (opcional, para despliegue con contenedores)

## Configuración del Proyecto

### Instalación Local

1. Clonar el repositorio:
   ```bash
   git clone <URL-del-repositorio>
   cd nombre-del-proyecto
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Modificar las variables según sea necesario.

4. Iniciar la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

### Compilación para Producción

Para generar la versión de producción:

```bash
npm run build
```

Los archivos generados se encontrarán en el directorio `dist`.

## Despliegue con Docker

### Usando Docker Compose (Recomendado)

1. Configurar variables de entorno en `docker-compose.yml` si es necesario.

2. Iniciar la aplicación:
   ```bash
   docker-compose up -d
   ```
   
   La aplicación estará disponible en `http://localhost:8080`

### Usando Docker Directamente

1. Construir la imagen:
   ```bash
   docker build -t nombre-del-proyecto .
   ```

2. Ejecutar el contenedor:
   ```bash
   docker run -p 8080:80 -e VITE_API_URL=http://localhost:3000 -d nombre-del-proyecto
   ```

## Variables de Entorno

| Variable      | Descripción                        | Valor por defecto        |
|---------------|------------------------------------|--------------------------|
| VITE_API_URL  | URL del servidor backend           | http://localhost:3000    |

### Configuración de Variables de Entorno

#### En Desarrollo Local

1. Crear un archivo `.env` en la raíz del proyecto:
   ```
   VITE_API_URL=http://localhost:3000
   ```

2. Las variables de entorno son cargadas automáticamente por Vite.

#### En Docker

Las variables de entorno se pueden configurar de varias maneras:

1. **En docker-compose.yml**:
   ```yaml
   environment:
     - VITE_API_URL=http://mi-api-url.com
   ```

2. **Al ejecutar el contenedor**:
   ```bash
   docker run -p 8080:80 -e VITE_API_URL=http://mi-api-url.com -d nombre-del-proyecto
   ```

3. **Con un archivo .env**:
   ```bash
   docker run -p 8080:80 --env-file .env -d nombre-del-proyecto
   ```

## Estructura del Proyecto

```
.
├── public/              # Archivos estáticos
├── src/                 # Código fuente
│   ├── components/      # Componentes React
│   ├── hooks/           # Hooks personalizados
│   ├── pages/           # Páginas/vistas de la aplicación
│   ├── services/        # Servicios para APIs
│   └── types/           # Definiciones de tipos
├── .env.example         # Ejemplo de variables de entorno
├── Dockerfile           # Configuración de Docker
├── docker-compose.yml   # Configuración de Docker Compose
└── vite.config.ts       # Configuración de Vite
```

## Características Principales

- Creación y edición de diagramas UML
- Conversión de imágenes a mockups
- Exportación de diagrama a código Angular
- Gestión de diagramas (guardar, cargar, exportar)
- Extracción de clases y atributos desde diagramas

## Resolución de Problemas

### La API no está disponible

Verifica que el servidor backend esté en ejecución y que la variable `VITE_API_URL` apunte a la dirección correcta.

### Problema con la autenticación

Si experimentas problemas de autenticación, verifica que:
1. El token se está almacenando correctamente en localStorage
2. El usuario está registrado en el sistema
3. Las credenciales son correctas

## Licencia

[Especificar licencia aquí]

## Contacto

[Información de contacto aquí]
# Front-P1
