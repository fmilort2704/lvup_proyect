# LvUp - Instrucciones de arranque

**Dominio principal de producción:**
[http://lvup.kesug.com/](http://lvup.kesug.com/)

## Arrancar el frontend (React)

En la raíz del proyecto, ejecuta:

```bash
npm start
```

Esto levantará la aplicación React en modo desarrollo en [http://localhost:3000](http://localhost:3000).

---

## Arrancar el backend Node (para imágenes y otros servicios)

1. Ve a la carpeta del backend Node (por ejemplo, `c:/Proyectos/backend/` si es tu ruta):
2. Ejecuta:

```bash
node index.js
```

Esto levantará el backend Node en el puerto configurado (por defecto suele ser el 3001 o 5000).

---

## Arrancar el backend PHP (Slim)

1. Debes tener XAMPP instalado y activo.
2. Coloca la carpeta `api` dentro de:

```
xampp/htdocs/Proyectos/LvUp_backend/api
```

3. Arranca Apache desde el panel de XAMPP.
4. El backend PHP estará disponible en:

```
http://localhost/Proyectos/LvUp_backend/api
```

---

## Despliegue en InfinityFree

El frontend y el backend PHP se despliegan juntos en InfinityFree.

### 1. Instalar FileZilla

Para subir los archivos a InfinityFree, instala FileZilla (https://filezilla-project.org/).

### 2. Conéctate por FTP con estos datos:
- **Servidor:** ftpupload.net
- **Usuario:** if0_39174413
- **Contraseña:** BCMRNQBc1
- **Puerto:** 21

### 3. Sube los archivos

1. **Frontend (React):**
   - Genera el build de producción ejecutando:
     ```bash
     npm run build
     ```
   - Sube el contenido de la carpeta `build` a la carpeta `htdocs` de tu hosting en InfinityFree usando FileZilla.

2. **Backend PHP (Slim):**
   - Sube la carpeta `api` del backend PHP a la ruta:
     ```
     htdocs/Proyectos/LvUp_backend/api
     ```
   - La estructura debe ser igual que en local con XAMPP.

### 4. Acceso
- El frontend será accesible desde la URL principal de tu dominio de InfinityFree.
- El backend PHP estará accesible desde:
  ```
  https://lvup.kesug.com/Proyectos/LvUp_backend/api
  ```

**Nota:**
- Asegúrate de que las rutas relativas en el frontend apunten correctamente al backend PHP en producción.
- Si usas rutas absolutas, actualízalas según el dominio de InfinityFree.

---

## Despliegue del backend Node (imágenes y servicios) en Railway

Puedes desplegar el backend Node (por ejemplo, para la gestión de imágenes) en Railway conectando tu repositorio de GitHub:

1. **Sube tu backend Node a un repositorio de GitHub**
   - Asegúrate de que el archivo `index.js` y el resto del backend estén en un repositorio propio.

2. **Crea un proyecto en Railway**
   - Ve a [https://railway.app/](https://railway.app/) y regístrate o inicia sesión.
   - Haz clic en "New Project" y elige "Deploy from GitHub repo".
   - Selecciona el repositorio donde tienes tu backend Node.

3. **Configura los comandos de despliegue**
   - Railway detectará automáticamente si tienes un `package.json` y usará `npm install` y `node index.js` o `npm start`.
   - Si necesitas un puerto específico, asegúrate de que tu backend use `process.env.PORT`.

4. **Variables de entorno**
   - Configura las variables de entorno necesarias (por ejemplo, credenciales, rutas, etc.) en la sección "Variables" de Railway.

5. **Obtén la URL pública**
   - Una vez desplegado, Railway te dará una URL pública para tu backend Node.
   - Usa esa URL en tu frontend o backend PHP para hacer peticiones al backend Node en producción.

**Nota:**
- El código fuente del backend Node (backend de React para imágenes y servicios) no está en este repositorio. Puedes consultarlo en:
  [https://github.com/fmilort2704/backend_react_project](https://github.com/fmilort2704/backend_react_project)
- Este repositorio está vinculado directamente con el host Railway para despliegue automático.
- Cada vez que hagas push a la rama principal del repositorio, Railway redeplegará automáticamente el backend.
- Si usas rutas relativas en desarrollo, recuerda cambiarlas a la URL de Railway en producción.

---

## Base de datos (MySQL)

### InfinityFree
Si usas InfinityFree, la base de datos y sus credenciales son:

- **Host:** sql113.infinityfree.com
- **Usuario:** if0_39174413
- **Contraseña:** BCMRNQBc1
- **Base de datos:** if0_39174413_db_lvup

Asegúrate de que el backend PHP use las credenciales correctas según el entorno donde esté desplegado.

---

## Resumen rápido

- Frontend: `npm start` en la raíz del proyecto.
- Backend Node: `node index.js` en la carpeta correspondiente.
- Backend PHP: asegúrate de tener la carpeta `api` en `xampp/htdocs/Proyectos/LvUp_backend` y Apache y MySQL arrancado.

---

## Notas
- Si tienes problemas de CORS, revisa que ambos backends permitan el origen de tu frontend.
- Para producción, asegúrate de que las rutas y dominios coincidan con tu despliegue.

---