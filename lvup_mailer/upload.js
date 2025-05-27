const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../public/img_lvup');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Endpoint para subir imagen
app.post('/img_lvup/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se recibió ninguna imagen.' });
  }
  res.json({ success: true, filename: req.file.filename });
});

// ... (otros endpoints, como /enviar_recibo, pueden ir aquí)

app.listen(4000, () => {
  console.log('Servidor escuchando en http://localhost:4000');
});
