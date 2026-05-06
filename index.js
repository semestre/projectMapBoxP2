const express = require("express");
const path = require("path");
require("dotenv").config();


const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.) desde el directorio raíz
// Esto permite que el servidor acceda a carpetas como 'styles/', 'mapBox/', etc.
app.use(express.static(path.join(__dirname)));

// Ruta para la página principal (raíz del servidor)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "map.html"));
});

// Ruta alternativa para acceder directamente a map.html
// Permite acceder tanto a http://localhost:3000 como a http://localhost:3000/map.html
app.get("/map.html", (req, res) => {
  res.sendFile(path.join(__dirname, "map.html"));
});

// Iniciar el servidor en el puerto 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
