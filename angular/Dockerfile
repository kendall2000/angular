# Usar la imagen base de Node.js 18 en lugar de Node.js 16
FROM node:18 AS build

# Define el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir la aplicación Angular
RUN npm run build --prod

# Usar una imagen de servidor web para servir la aplicación
FROM nginx:alpine

# Copiar los archivos construidos desde el paso anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto en el que Nginx escucha
EXPOSE 80

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
