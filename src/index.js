// ============================================
// index.js
// Coordina los tres pasos del programa
// ============================================

const fs = require("fs");
const path = require("path");
const mundo = require("./mundo");
const texto = require("./texto");
const imagen = require("./imagen");

const RAIZ = path.join(__dirname, "..");

// Carga las variables del archivo .env
function cargarEnv() {
  const rutaEnv = path.join(RAIZ, ".env");
  if (!fs.existsSync(rutaEnv)) {
    throw new Error("No se encontró el archivo .env. Copia .env.example como .env y completa tus datos.");
  }
  process.loadEnvFile(rutaEnv);
}

async function main() {
  let huboProgreso = false;

  try {
    cargarEnv();

    // ---------- Paso 1: crear, guardar y leer el mundo ----------
    const nuevo = mundo.crearMundo(process.argv.slice(2));
    const rutaJson = mundo.guardarMundo(nuevo);
    huboProgreso = true;
    console.log(`Paso 1: mundo guardado en data/mundo_${nuevo.id}.json`);

    // Volvemos a leer el JSON guardado (no usamos el objeto en memoria)
    const mundoLeido = mundo.leerMundo(rutaJson);

    // ---------- Paso 2: descripción con el modelo de texto ----------
    const carpetaDescripciones = path.join(RAIZ, "descripciones");
    const rutaTxt = path.join(carpetaDescripciones, `mundo_${mundoLeido.id}.txt`);

    if (fs.existsSync(rutaTxt)) {
      console.log("Paso 2: la descripción ya existía, no se llamó al modelo de texto.");
    } else {
      const descripcion = await texto.describirMundo(mundoLeido);
      fs.mkdirSync(carpetaDescripciones, { recursive: true });
      fs.writeFileSync(rutaTxt, descripcion, "utf-8");
      console.log(`Paso 2: descripción guardada en descripciones/mundo_${mundoLeido.id}.txt`);
    }

    // ---------- Paso 3: imagen con el modelo de imágenes ----------
    const carpetaImagenes = path.join(RAIZ, "imagenes");
    const rutaJpg = path.join(carpetaImagenes, `mundo_${mundoLeido.id}.jpg`);

    if (fs.existsSync(rutaJpg)) {
      console.log("Paso 3: la imagen ya existía, no se llamó al modelo de imágenes.");
    } else {
      // La descripción se lee desde el .txt guardado
      const descripcionGuardada = fs.readFileSync(rutaTxt, "utf-8");
      const bytes = await imagen.generarImagen(descripcionGuardada);
      fs.mkdirSync(carpetaImagenes, { recursive: true });
      fs.writeFileSync(rutaJpg, bytes); // bytes tal cual, SIN "utf-8"
      console.log(`Paso 3: imagen guardada en imagenes/mundo_${mundoLeido.id}.jpg`);
    }

    console.log("Listo. Revisa la carpeta imagenes/");
  } catch (error) {
    console.error("Error: " + error.message);
    if (huboProgreso) {
      console.error("Los archivos ya generados se conservaron. Puedes volver a ejecutar el programa.");
    }
    process.exitCode = 1;
  }
}

main();