#!/bin/sh
set -e

# Reemplazar variables de entorno en los archivos JavaScript
if [ -n "$VITE_API_URL" ]; then
  echo "Configurando API URL: $VITE_API_URL"
  
  # Buscar archivos JS que contengan la URL por defecto
  JS_FILES=$(grep -l "http://localhost:3000" /usr/share/nginx/html/*.js || true)
  
  if [ -n "$JS_FILES" ]; then
    echo "Reemplazando URL en archivos JS..."
    for file in $JS_FILES; do
      echo "Procesando: $file"
      sed -i "s|http://localhost:3000|$VITE_API_URL|g" "$file"
    done
  else
    echo "No se encontraron archivos JS con la URL predeterminada."
  fi
else
  echo "ADVERTENCIA: Variable VITE_API_URL no definida, usando URL predeterminada."
fi

# Ejecutar el comando pasado (nginx)
echo "Iniciando servidor web..."
exec "$@" 