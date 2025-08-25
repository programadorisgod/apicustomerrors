# API Custom Errors v2.0.0 🚀

[![npm version](https://badge.fury.io/js/apicustomerrors.svg)](https://www.npmjs.com/package/apicustomerrors)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![RFC 9457](https://img.shields.io/badge/RFC-9457-orange.svg)](https://www.rfc-editor.org/rfc/rfc9457.html)

**Manejo avanzado de errores HTTP siguiendo el estándar RFC 9457 "Problem Details for HTTP APIs"**

Este paquete proporciona clases de error especializadas y middleware para Express que implementan completamente el estándar RFC 9457, ofreciendo respuestas de error estructuradas, ricas en información y compatibles internacionalmente.

## 📋 Tabla de Contenidos

- [¿Qué hay de nuevo en v2.0.0?](#-qué-hay-de-nuevo-en-v200)
- [RFC 9457 - Problem Details](#-rfc-9457---problem-details)
- [Instalación](#-instalación)
- [Uso Básico](#-uso-básico)
- [Clases de Error Disponibles](#-clases-de-error-disponibles)
- [Middleware para Express](#-middleware-para-express)
- [Ejemplos Avanzados](#-ejemplos-avanzados)
- [Migración desde v1.x](#-migración-desde-v1x)
- [API Reference](#-api-reference)

## 🆕 ¿Qué hay de nuevo en v2.0.0?

La versión 2.0.0 es una **reescritura completa** que implementa el estándar **RFC 9457**:

- ✅ **Nueva clase base `ProblemDetailsError`** con campos estándar RFC 9457
- ✅ **Middleware automático para Express** (`problemDetailsHandler`)
- ✅ **Clase `VALIDATION_ERROR`** para errores de validación complejos
- ✅ **Campos de extensión personalizables** (`extra`, `errors`)
- ✅ **URLs de tipo configurables** para documentación
- ✅ **Timestamps automáticos** y campos `instance`
- ✅ **Compatibilidad total con RFC 9457**

## 🌐 RFC 9457 - Problem Details

RFC 9457 define un formato estándar para describir errores en APIs HTTP. En lugar de respuestas simples:

**❌ ANTES (Error simple):**
```json
{
  "error": "User not found",
  "code": 404
}
```

**✅ AHORA (RFC 9457):**
```json
{
  "type": "https://httpstatuses.io/404",
  "title": "Not Found",
  "status": 404,
  "detail": "El usuario con ID '123' no existe en el sistema",
  "instance": "/users/123",
  "extra": {
    "resourceType": "user",
    "resourceId": "123",
    "suggestions": [
      {
        "action": "list_users",
        "url": "/users",
        "description": "Ver todos los usuarios disponibles"
      }
    ]
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}
```

## 📦 Instalación

```bash
npm install apicustomerrors
```

**Requisitos:**
- Node.js 16+
- Proyecto con `"type": "module"` en `package.json`

## 🚀 Uso Básico

### Importar las clases de error

```javascript
import { 
  ProblemDetailsError,
  BAD_REQUEST_ERROR, 
  NOT_FOUND_ERROR, 
  UNAUTHORIZED_ERROR,
  VALIDATION_ERROR,
  problemDetailsHandler 
} from 'apicustomerrors';
```

### Uso en Express

```javascript
import express from 'express';
import { NOT_FOUND_ERROR, problemDetailsHandler } from 'apicustomerrors';

const app = express();

app.get('/users/:id', (req, res, next) => {
  const user = database.findUser(req.params.id);
  
  if (!user) {
    const error = new NOT_FOUND_ERROR({
      detail: `Usuario con ID '${req.params.id}' no encontrado`,
      extra: {
        searchedAt: new Date().toISOString(),
        resourceType: 'user',
        resourceId: req.params.id
      }
    });
    return next(error);
  }
  
  res.json(user);
});

// ¡IMPORTANTE! Agregar el middleware al final
app.use(problemDetailsHandler());

app.listen(3000);
```

### Respuesta automática RFC 9457

```http
GET /users/999
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "https://httpstatuses.io/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Usuario con ID '999' no encontrado",
  "instance": "/users/999",
  "extra": {
    "searchedAt": "2023-10-15T10:30:00.123Z",
    "resourceType": "user",
    "resourceId": "999"
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}
```

## 🎯 Clases de Error Disponibles

| Clase | Status | Descripción | Nuevo en v2.0 |
|-------|--------|-------------|----------------|
| `BAD_REQUEST_ERROR` | 400 | Solicitud malformada | ⬆️ |
| `UNAUTHORIZED_ERROR` | 401 | No autorizado | ⬆️ |
| `FORBIDDEN_ERROR` | 403 | Prohibido | ⬆️ |
| `NOT_FOUND_ERROR` | 404 | Recurso no encontrado | ⬆️ |
| `METHOD_NOT_ALLOWED_ERROR` | 405 | Método no permitido | ⬆️ |
| `CONFLICT_ERROR` | 409 | Conflicto | ⬆️ |
| `UNSUPPORTED_MEDIA_TYPE_ERROR` | 415 | Tipo de medio no soportado | ⬆️ |
| `VALIDATION_ERROR` | 422 | Errores de validación | ✅ **NUEVO** |
| `TOO_MANY_REQUESTS_ERROR` | 429 | Demasiadas solicitudes | ⬆️ |
| `INTERNAL_SERVER_ERROR` | 500 | Error interno del servidor | ⬆️ |
| `SERVICE_UNAVAILABLE_ERROR` | 503 | Servicio no disponible | ⬆️ |
| `ProblemDetailsError` | Personalizable | Clase base para errores personalizados | ✅ **NUEVO** |

**Leyenda:** ⬆️ = Actualizada con RFC 9457 | ✅ = Nueva clase

## 🔧 Middleware para Express

### Configuración Básica

```javascript
import { problemDetailsHandler } from 'apicustomerrors';

// Agregar AL FINAL de todos los middlewares
app.use(problemDetailsHandler());
```

### Funcionalidades del Middleware

- ✅ **Detección automática** de errores `ProblemDetailsError`
- ✅ **Asignación automática** del campo `instance` con `req.originalUrl`
- ✅ **Respuesta JSON** con Content-Type correcto
- ✅ **Conversión automática** de errores nativos a Problem Details

### Ejemplo con múltiples tipos de error

```javascript
import express from 'express';
import { 
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR, 
  VALIDATION_ERROR,
  problemDetailsHandler 
} from 'apicustomerrors';

const app = express();
app.use(express.json());

// Ruta con validación
app.post('/users', (req, res, next) => {
  const { name, email, age } = req.body;
  const errors = [];

  if (!name) {
    errors.push({
      field: 'name',
      message: 'El nombre es obligatorio',
      pointer: '#/name'
    });
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push({
      field: 'email',
      message: 'Email válido requerido',
      pointer: '#/email'
    });
  }

  if (errors.length > 0) {
    const error = new VALIDATION_ERROR({
      detail: `Se encontraron ${errors.length} errores de validación`,
      errors: errors,
      extra: {
        totalErrors: errors.length,
        providedFields: Object.keys(req.body)
      }
    });
    return next(error);
  }

  res.status(201).json({ message: 'Usuario creado' });
});

// Ruta protegida
app.get('/admin', (req, res, next) => {
  if (!req.headers.authorization) {
    const error = new UNAUTHORIZED_ERROR({
      detail: 'Token de autorización requerido',
      extra: {
        requiredHeader: 'Authorization',
        authTypes: ['Bearer', 'Basic'],
        loginUrl: 'https://api.example.com/login'
      }
    });
    return next(error);
  }
  
  res.json({ message: 'Panel administrativo' });
});

// Middleware de manejo de errores (AL FINAL)
app.use(problemDetailsHandler());
```

## 🔥 Ejemplos Avanzados

### 1. Error Personalizado con ProblemDetailsError

```javascript
import { ProblemDetailsError } from 'apicustomerrors';

const businessRuleError = new ProblemDetailsError({
  type: "https://api.miempresa.com/problems/insufficient-funds",
  title: "Insufficient Funds", 
  status: 402,
  detail: "Su saldo actual no es suficiente para esta transacción",
  instance: "/transactions/tx-12345",
  errors: [
    {
      rule: "minimum-balance",
      message: "Saldo mínimo requerido: $10.00",
      currentBalance: 5.50,
      requiredBalance: 10.00
    }
  ],
  extra: {
    accountId: "acc-67890",
    transactionAmount: 25.00,
    currentBalance: 5.50,
    suggestedActions: [
      {
        action: "add_funds",
        url: "https://api.miempresa.com/billing/add-funds",
        description: "Agregar fondos a su cuenta"
      },
      {
        action: "contact_support",
        phone: "+1-800-123-4567",
        email: "support@miempresa.com",
        description: "Contactar soporte para asistencia"
      }
    ]
  }
});

// Usar en Express
app.post('/transactions', (req, res, next) => {
  if (insufficientFunds()) {
    return next(businessRuleError);
  }
  // ... lógica de transacción
});
```

### 2. VALIDATION_ERROR con múltiples campos

```javascript
import { VALIDATION_ERROR } from 'apicustomerrors';

const validationError = new VALIDATION_ERROR({
  detail: "Los datos del formulario contienen errores múltiples",
  errors: [
    {
      field: "email",
      message: "Formato de email inválido",
      providedValue: "invalid-email",
      pointer: "#/contact/email",
      rule: "email-format"
    },
    {
      field: "age",
      message: "La edad debe estar entre 18 y 100 años",
      providedValue: 15,
      pointer: "#/personal/age", 
      rule: "age-range",
      constraints: { min: 18, max: 100 }
    },
    {
      field: "password",
      message: "La contraseña debe tener al menos 8 caracteres",
      providedValue: "[HIDDEN]",
      pointer: "#/security/password",
      rule: "password-strength"
    }
  ],
  extra: {
    totalErrors: 3,
    validationEngine: "joi-validator-v2.1",
    requestTimestamp: new Date().toISOString(),
    clientInfo: {
      userAgent: "Mozilla/5.0...",
      ipAddress: "192.168.1.100"
    }
  }
});
```

### 3. Error con enlaces de documentación

```javascript
import { BAD_REQUEST_ERROR } from 'apicustomerrors';

const apiError = new BAD_REQUEST_ERROR({
  type: "https://docs.miapi.com/errors/invalid-request-format",
  detail: "El formato de la solicitud no es válido para este endpoint",
  extra: {
    expectedFormat: "application/json",
    receivedFormat: "text/plain",
    documentation: {
      apiReference: "https://docs.miapi.com/api/reference",
      examples: "https://docs.miapi.com/api/examples",
      support: "https://support.miapi.com"
    },
    correctExample: {
      "Content-Type": "application/json",
      "body": {
        "name": "string",
        "email": "string"
      }
    }
  }
});
```

## 🔄 Migración desde v1.x

### Cambios en Constructores

**❌ ANTES (v1.x):**
```javascript
const error = new NOT_FOUND_ERROR("Usuario no encontrado");
console.log(error.statusCode); // 404
```

**✅ AHORA (v2.0.0):**
```javascript
const error = new NOT_FOUND_ERROR({
  detail: "Usuario no encontrado",
  extra: { userId: "123" }
});
console.log(error.status); // 404
console.log(error.toJSON()); // Formato RFC 9457 completo
```

### Middleware Requerido

**Agregar al final de tus middlewares:**

```javascript
import { problemDetailsHandler } from 'apicustomerrors';

// Todas tus rutas...

// AL FINAL - Middleware de manejo de errores
app.use(problemDetailsHandler());
```

### Tabla de Migración

| v1.x | v2.0.0 | Cambio |
|------|--------|---------|
| `new ERROR("mensaje")` | `new ERROR({ detail: "mensaje" })` | Constructor con objeto |
| `error.statusCode` | `error.status` | Propiedad renombrada |
| `error.message` | `error.detail` | Campo RFC 9457 |
| Sin middleware | `problemDetailsHandler()` | Middleware requerido |
| Error simple | `error.toJSON()` | Formato RFC 9457 |

## 📚 API Reference

### ProblemDetailsError

Clase base que implementa RFC 9457.

```javascript
new ProblemDetailsError({
  type,      // string - URI que identifica el tipo de problema
  title,     // string - Resumen corto del problema  
  status,    // number - Código de estado HTTP
  detail,    // string - Descripción específica del problema
  instance,  // string - URI de esta ocurrencia específica
  errors,    // array - Lista de errores específicos
  extra      // object - Información adicional personalizada
})
```

### Campos RFC 9457

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `type` | string | No | URI que identifica el tipo de problema |
| `title` | string | No | Resumen corto y legible del problema |
| `status` | number | Sí | Código de estado HTTP |
| `detail` | string | No | Explicación específica de esta ocurrencia |
| `instance` | string | No | URI que identifica esta ocurrencia específica |
| `timestamp` | string | Auto | ISO timestamp de cuando ocurrió el error |

### Campos de Extensión

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `errors` | array | Lista de errores específicos (útil para validación) |
| `extra` | object | Información adicional personalizada |

### Métodos

#### `toJSON()`
Retorna el error en formato RFC 9457.

```javascript
const error = new NOT_FOUND_ERROR({
  detail: "Recurso no encontrado",
  extra: { resourceId: "123" }
});

console.log(error.toJSON());
// {
//   "type": "https://httpstatuses.io/404",
//   "title": "Not Found", 
//   "status": 404,
//   "detail": "Recurso no encontrado",
//   "extra": { "resourceId": "123" },
//   "timestamp": "2023-10-15T10:30:00.123Z"
// }
```

### problemDetailsHandler()

Middleware para Express que maneja automáticamente errores RFC 9457.

```javascript
import { problemDetailsHandler } from 'apicustomerrors';

app.use(problemDetailsHandler());
```

**Funcionalidades:**
- Detecta instancias de `ProblemDetailsError`
- Asigna automáticamente `req.originalUrl` a `instance`
- Establece el Content-Type correcto
- Convierte errores nativos a formato Problem Details

## 🌟 Ejemplos de Respuestas

### Error de Validación Completo

```http
POST /users
Content-Type: application/json

{
  "name": "",
  "email": "invalid-email",
  "age": -5
}
```

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://httpstatuses.io/422",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Se encontraron 3 errores de validación en los datos proporcionados",
  "instance": "/users",
  "errors": [
    {
      "field": "name",
      "message": "El nombre no puede estar vacío",
      "providedValue": "",
      "pointer": "#/name"
    },
    {
      "field": "email", 
      "message": "Formato de email inválido",
      "providedValue": "invalid-email",
      "pointer": "#/email"
    },
    {
      "field": "age",
      "message": "La edad debe ser un número positivo",
      "providedValue": -5,
      "pointer": "#/age" 
    }
  ],
  "extra": {
    "totalErrors": 3,
    "validationEngine": "custom-validator",
    "requestId": "req-1634567890123"
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}
```

### Error de Negocio con Sugerencias

```http
HTTP/1.1 402 Payment Required  
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 402,
  "detail": "Su saldo actual ($5.50) no es suficiente para esta transacción ($25.00)",
  "instance": "/transactions/tx-12345",
  "extra": {
    "currentBalance": 5.50,
    "requiredAmount": 25.00,
    "accountId": "acc-67890",
    "suggestedActions": [
      {
        "action": "add_funds",
        "url": "/billing/add-funds",
        "description": "Agregar fondos a su cuenta"
      },
      {
        "action": "contact_support", 
        "phone": "+1-800-123-4567",
        "description": "Contactar soporte para asistencia"
      }
    ]
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🔗 Enlaces Útiles

- [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [HTTP Status Codes Reference](https://httpstatuses.io/)
- [Repositorio en GitHub](https://github.com/programadorisgod/apicustomerrors)
- [Paquete en NPM](https://www.npmjs.com/package/apicustomerrors)

## 📞 Soporte

- **GitHub Issues**: [Crear Issue](https://github.com/programadorisgod/apicustomerrors/issues)
- **Email**: [Contactar](mailto:support@example.com)

---

**¡Desarrolla APIs con manejo de errores profesional y estándar! 🚀**