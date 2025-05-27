const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Endpoint para eliminar imagen
app.post('/img_lvup/delete', (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, error: 'Falta el nombre de la imagen.' });
    const filePath = path.join(__dirname, '../public/img_lvup', filename);
    fs.unlink(filePath, err => {
        if (err) {
            return res.status(500).json({ success: false, error: 'No se pudo eliminar la imagen.' });
        }
        res.json({ success: true });
    });
});

// ...otros endpoints existentes...

module.exports = app;
