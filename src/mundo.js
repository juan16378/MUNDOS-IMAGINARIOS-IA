// ============================================
// mundo.js
// Valida, crea, guarda y lee el mundo (JSON)
// ============================================

const fs = require("fs");
const path = require("path");
const objectHash = require("object-hash");

// Carpeta "data" (una carpeta arriba de "src")
const CARPETA_DATA = path.join(__dirname, "..", "data");

// Mensaje de ayuda que se muestra cuando algo falla
const USO =
  'Uso: npm start -- "<situación>" "<mundo>" <color1> <color2> <color3> <color4> <color5>\n' +
  'Ejemplo: npm start -- "Una tormenta" "Aerópolis, ciudad flotante" rojo azul verde dorado violeta';

// ------------------------------------------------
// Valida los argumentos y crea el objeto del mundo
// ------------------------------------------------
function crearMundo(args) {
  // 1. Deben llegar exactamente 7 argumentos
  if (args.length !== 7) {
    throw new Error(
      `Debes escribir exactamente 7 argumentos (situación, mundo y 5 colores) y recibí ${args.length}.\n${USO}`
    );
  }

  // 2. Ninguno puede estar vacío ni tener solo espacios
  for (let i = 0; i < args.length; i++) {
    if (args[i].trim() === "") {
      throw new Error(`Ningún argumento puede estar vacío.\n${USO}`);
    }
  }

  const situacion = args[0].trim();
  const mundo = args[1].trim();
  const colores = args.slice(2).map(function (color) {
    return color.trim().toLowerCase();
  });

  // 3. Los 5 colores deben ser distintos (sin importar mayúsculas)
  for (let i = 0; i < colores.length; i++) {
    for (let j = i + 1; j < colores.length; j++) {
      if (colores[i] === colores[j]) {
        throw new Error(`El color "${colores[i]}" está repetido. Los 5 colores deben ser distintos.\n${USO}`);
      }
    }
  }

  // 4. El id usa SOLO situación, mundo y colores (sin la fecha)
  const id = objectHash({ situacion, mundo, colores }).slice(0, 8);

  return {
    id: id,
    situacion: situacion,
    mundo: mundo,
    colores: colores,
    creadoEn: new Date().toISOString(),
  };
}

// ------------------------------------------------
// Guarda el objeto en data/mundo_<id>.json y devuelve la ruta
// ------------------------------------------------
function guardarMundo(mundo) {
  fs.mkdirSync(CARPETA_DATA, { recursive: true });
  const ruta = path.join(CARPETA_DATA, `mundo_${mundo.id}.json`);

  // Si ya existe, no lo sobrescribimos (se conserva la fecha original)
  if (!fs.existsSync(ruta)) {
    fs.writeFileSync(ruta, JSON.stringify(mundo, null, 2), "utf-8");
  }
  return ruta;
}

// ------------------------------------------------
// Lee el archivo JSON y lo convierte en objeto
// ------------------------------------------------
function leerMundo(ruta) {
  return JSON.parse(fs.readFileSync(ruta, "utf-8"));
}

module.exports = { crearMundo, guardarMundo, leerMundo };