FROM node:21-alpine as build

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY eslint.config.js ./

# Copiar el archivo .env (o crear uno predeterminado si no existe)
COPY .env* ./
# En caso de que .env no exista, creamos uno predeterminado
RUN if [ ! -f .env ]; then echo "VITE_API_URL=http://localhost:3000" > .env; fi

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY src/ ./src/
COPY public/ ./public/

# Construir la aplicación
RUN npm run build

# Imagen de producción
FROM nginx:alpine

# Copiar la aplicación construida
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80

# Archivo de configuración para variables de entorno en tiempo de ejecución
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 