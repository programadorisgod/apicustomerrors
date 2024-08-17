# Api custom errors
Este paquete proporciona una serie de clases de error personalizadas para manejar diferentes tipos de errores HTTP en aplicaciones JavaScript. Estas clases extienden la clase `Error` nativa de JavaScript, proporcionando una manera estructurada de manejar errores en tu aplicación 0 dependencias adicionales.

## Clases Disponibles

El paquete incluye las siguientes clases de error personalizadas:

- `BAD_REQUEST_ERROR`: Para errores de solicitud incorrecta (400).
- `UNAUTHORIZED_ERROR`: Para errores de no autorizado (401).
- `FORBIDDEN_ERROR`: Para errores de prohibido (403).
- `NOT_FOUND_ERROR`: Para errores de recurso no encontrado (404).
- `METHOD_NOT_ALLOWED_ERROR`: Para errores de método no permitido (405).
- `TOO_MANY_REQUESTS_ERROR`: Para errores de demasiadas solicitudes (429).
- `CONFLICT_ERROR`: Para errores de conflicto (409).
- `UNSUPPORTED_MEDIA_TYPE_ERROR`: Para errores de tipo de medio no soportado (415).
- `INTERNAL_SERVER_ERROR`: Para errores internos del servidor (500).
- `SERVICE_UNAVAILABLE_ERROR`: Para errores de servicio no disponible (503).

Cada clase de error incluye un `name` personalizado, un `statusCode` correspondiente al error HTTP, y un mensaje de error opcional.

## Instalación

```bash
npm i apicustomerrors
```
## Uso
Para usar una de las clases de error en tu aplicación, primero debes importarla:
```JavaScript
import { BAD_REQUEST_ERROR, UNAUTHORIZED_ERROR, FORBIDDEN_ERROR } from 'apicustomerrors';
```
Luego, puedes utilizar estas clases para lanzar errores en tu aplicación:
```JavaScript
function validarUsuario(usuario) {
  if (!usuario) {
    throw new UNAUTHORIZED_ERROR('Usuario no autorizado.');
  }
}

try {
  validarUsuario(null);
} catch (error) {
  console.error(error.statusCode); // 401
  console.error(error.message); // Usuario no autorizado.
}
```

