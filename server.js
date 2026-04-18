const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2');
const path    = require('path');
const app     = express();

app.use(cors());
app.use(express.json());

// Sirve el index.html como página principal
app.use(express.static(path.join(__dirname, 'public')));

// ─── Conexión MySQL ───────────────────────────────────────────


// const db = mysql.createConnection({
//  host:     process.env.DB_HOST     || 'localhost',
//  user:     process.env.DB_USER     || 'root',
//  password: process.env.DB_PASS     || '',
//  database: process.env.DB_NAME     || 'hidroponia',
//  port:     process.env.DB_PORT     || 3306
//});
//
//db.connect(err => {
//  if (err) console.error('Error MySQL:', err);
//  else console.log('MySQL conectado');
//});

// ─── Estado de actuadores ─────────────────────────────────────
let estado = { bomba: false, led: false };

// ─── Última lectura de sensores ───────────────────────────────
let ultimaLectura = {};

// ─── Rutas ────────────────────────────────────────────────────

// ESP32 envía datos de sensores
app.post('/datos', (req, res) => {
  const { distancia, temperatura, humedad, calidadAire, luz } = req.body;
  ultimaLectura = { distancia, temperatura, humedad, calidadAire, luz };

  // Guardar en MySQL
//  db.query(
//    'INSERT INTO lecturas (distancia, temperatura, humedad, calidad_aire, luz) VALUES (?,?,?,?,?)',
//    [distancia, temperatura, humedad, calidadAire, luz],
//    err => { if (err) console.error('Error MySQL:', err); }
//  );

  res.json({ ok: true });
});

// Web y ESP32 consultan estado de actuadores
app.get('/estado', (req, res) => {
  res.json(estado);
});

// Web cambia estado de actuadores
app.post('/control', (req, res) => {
  const { bomba, led } = req.body;
  if (bomba !== undefined) estado.bomba = bomba;
  if (led   !== undefined) estado.led   = led;
  console.log('Control:', estado);
  res.json({ ok: true, ...estado });
});

// Web consulta última lectura de sensores
app.get('/lecturas', (req, res) => {
  res.json(ultimaLectura);
});

// Web consulta historial
app.get('/historial', (req, res) => {
  db.query('SELECT * FROM lecturas ORDER BY fecha DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en puerto ' + PORT));