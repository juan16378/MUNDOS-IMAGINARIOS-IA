# mundos-ia

Programa de consola en Node.js. Recibe una situación, un mundo imaginario y 5 colores, y genera una descripción (texto) y una imagen con IA.

## Cómo configurarlo

1. Instala las dependencias:

```
npm install
```


## Cómo usarlo

```
npm start -- "Una tormenta eléctrica amenaza la ciudad flotante" "Aerópolis, un archipiélago de islas que flotan sobre las nubes" rojo azul verde dorado violeta
```

Resultado:

```
Paso 1: mundo guardado en data/mundo_<id>.json
Paso 2: descripción guardada en descripciones/mundo_<id>.txt
Paso 3: imagen guardada en imagenes/mundo_<id>.jpg
Listo. Revisa la carpeta imagenes/
```

Si repites el comando, no se vuelve a llamar a ninguna API.

## Carpetas

```
mundos-ia/
├── src/
│   ├── index.js    coordina los pasos
│   ├── mundo.js    valida y guarda el JSON
│   ├── texto.js    API de texto
│   └── imagen.js   API de imágenes
├── data/           archivos .json
├── descripciones/  archivos .txt
├── imagenes/       archivos .jpg
├── .env            claves (no va a Git)
└── .env.example    plantilla del .env
```

## Servicios

- Texto: [Groq](https://console.groq.com/keys), modelo `openai/gpt-oss-20b`
- Imagen: [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/get-started/rest-api/), modelo FLUX.1-schnell

## Autor

Juan Jose Rodriguez