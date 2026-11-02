// ============================================
// texto.js
// Pide al modelo de lenguaje la descripción de la imagen
// ============================================

// Instrucciones para el modelo (mensaje de sistema)
const SISTEMA =
  "You write prompts for an AI image generator. " +
  "You will receive a JSON with a situation, an imaginary world and five colors (in Spanish). " +
  "Reply with ONE single paragraph in English, between 80 and 120 words, describing an image of that world: " +
  "the scene, the main elements, the lighting, the composition and the artistic style. " +
  "Mention all five colors (translate them to English). " +
  "Do not tell a story. No titles, no markdown, no lists and no written text inside the image.";

// Convierte un código de error HTTP en un mensaje en español
function errorPorEstado(respuesta) {
  const estado = respuesta.status;
  if (estado === 401 || estado === 403) {
    return new Error("La API key de texto no es válida o no tiene permisos. Revisa tu archivo .env.");
  }
  if (estado === 402 || estado === 429) {
    let mensaje = "Superaste el límite gratuito del modelo de texto. Espera un momento e intenta de nuevo.";
    const espera = respuesta.headers.get("retry-after");
    if (espera) {
      mensaje += ` (retry-after: ${espera})`;
    }
    return new Error(mensaje);
  }
  if (estado === 404 || estado === 410) {
    return new Error("El modelo o la URL de texto no existen. Revisa TEXTO_URL y TEXTO_MODELO en tu .env.");
  }
  return new Error(`El modelo de texto respondió con el error ${estado}.`);
}

// ------------------------------------------------
// Envía el mundo al modelo y devuelve la descripción
// ------------------------------------------------
async function describirMundo(mundo) {
  const clave = process.env.TEXTO_API_KEY;
  const url = process.env.TEXTO_URL;
  const modelo = process.env.TEXTO_MODELO;

  if (!clave || !url || !modelo) {
    throw new Error("Faltan datos de texto en el .env (TEXTO_API_KEY, TEXTO_URL o TEXTO_MODELO).");
  }

  let respuesta;
  try {
    respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + clave,
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          { role: "system", content: SISTEMA },
          { role: "user", content: JSON.stringify(mundo) },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error("El servicio de texto tardó demasiado en responder.");
    }
    throw new Error("No se pudo conectar con el servicio de texto. Revisa tu internet o la URL.");
  }

  if (!respuesta.ok) {
    throw errorPorEstado(respuesta);
  }

  const datos = await respuesta.json();
  let descripcion = "";
  if (datos.choices && datos.choices[0] && datos.choices[0].message) {
    descripcion = datos.choices[0].message.content || "";
  }
  descripcion = descripcion.trim();

  // Si llega vacía, es un error
  if (descripcion === "") {
    throw new Error("El modelo de texto devolvió una descripción vacía.");
  }

  // Si es muy larga, la recortamos y avisamos (Cloudflare acepta máximo 2048)
  if (descripcion.length > 1500) {
    descripcion = descripcion.slice(0, 1500);
    console.log("Aviso: la descripción superaba los 1500 caracteres y se recortó.");
  }

  return descripcion;
}

module.exports = { describirMundo };