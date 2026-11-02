// ============================================
// imagen.js
// Pide al modelo de imágenes la imagen y devuelve los bytes
// (Cloudflare Workers AI · FLUX.1-schnell)
// ============================================

// Convierte un código de error HTTP en un mensaje en español
function errorPorEstado(respuesta) {
  const estado = respuesta.status;
  if (estado === 401 || estado === 403) {
    return new Error("El token de imágenes no es válido o no tiene permisos. Revisa tu archivo .env.");
  }
  if (estado === 402 || estado === 429) {
    let mensaje = "Superaste el límite gratuito del modelo de imágenes. Espera un momento o intenta mañana.";
    const espera = respuesta.headers.get("retry-after");
    if (espera) {
      mensaje += ` (retry-after: ${espera})`;
    }
    return new Error(mensaje);
  }
  if (estado === 404 || estado === 410) {
    return new Error("El modelo o la URL de imágenes no existen. Revisa IMAGEN_URL (y tu Account ID) en el .env.");
  }
  return new Error(`El modelo de imágenes respondió con el error ${estado}.`);
}

// ------------------------------------------------
// Envía la descripción y devuelve los bytes de la imagen
// ------------------------------------------------
async function generarImagen(descripcion) {
  const clave = process.env.IMAGEN_API_KEY;
  const url = process.env.IMAGEN_URL;

  if (!clave || !url) {
    throw new Error("Faltan datos de imagen en el .env (IMAGEN_API_KEY o IMAGEN_URL).");
  }

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + clave,
      },
      body: JSON.stringify({ prompt: descripcion, steps: 4 }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error("El servicio de imágenes tardó demasiado en responder.");
    }
    throw new Error("No se pudo conectar con el servicio de imágenes. Revisa tu internet o la URL.");
  }

  if (!respuesta.ok) {
    throw errorPorEstado(respuesta);
  }

  const datos = await respuesta.json();

  // En Cloudflare la imagen llega en base64 dentro de result.image
  if (!datos.result || !datos.result.image) {
    throw new Error("El modelo de imágenes no devolvió ninguna imagen.");
  }

  // Convertimos el texto base64 en bytes
  const bytes = Buffer.from(datos.result.image, "base64");
  if (bytes.length === 0) {
    throw new Error("La imagen recibida está vacía.");
  }

  return bytes;
}

module.exports = { generarImagen };