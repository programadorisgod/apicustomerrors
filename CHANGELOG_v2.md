# CHANGELOG - API Custom Errors v2.0.0

## 🚀 Versión 2.0.0 - Implementación Completa de RFC 9457

**Fecha de Lanzamiento:** Octubre 2023

Esta versión representa una **reescritura completa** del paquete para implementar el estándar **RFC 9457 - Problem Details for HTTP APIs**. Se han introducido cambios arquitectónicos mayores que mejoran significativamente la forma de manejar errores en APIs HTTP.

---

## 📋 ¿Qué es RFC 9457?

RFC 9457 "Problem Details for HTTP APIs" es un estándar que define un formato común para describir errores en APIs HTTP. En lugar de devolver errores simples, ahora puedes proporcionar:

- **Información estructurada** sobre el error
- **Detalles específicos** de la ocurrencia
- **Datos de contexto** adicionales
- **Enlaces de resolución** y sugerencias
- **Compatibilidad** entre diferentes APIs

---

## 🔄 CAMBIOS ARQUITECTÓNICOS PRINCIPALES

### 1. **Nueva Clase Base: `ProblemDetailsError`**

**ANTES (v1.x):**
```javascript
class NOT_FOUND_ERROR extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NOT_FOUND_ERROR";
    this.statusCode = 404;
  }
}
```

**AHORA (v2.0.0):**
```javascript
class NOT_FOUND_ERROR extends ProblemDetailsError {
  constructor({ type, title, detail, extra }) {
    super({
      type: type || "https://httpstatuses.io/404",
      title: title || "Not Found",
      detail: detail || "The requested resource could not be found.",
      status: 404,
      extra: extra
    });
  }
}
```

### 2. **Campos RFC 9457 Estándar**

Todos los errores ahora incluyen campos estándares:

```javascript
{
  "type": "https://httpstatuses.io/404",           // URI que identifica el tipo de problema
  "title": "Not Found",                           // Resumen corto del problema
  "status": 404,                                  // Código de estado HTTP
  "detail": "El usuario con ID 123 no existe",   // Descripción específica
  "instance": "/users/123",                       // URI de esta ocurrencia específica
  "timestamp": "2023-10-15T10:30:00.123Z",      // Timestamp automático
  "extra": {                                      // Datos adicionales personalizados
    "resourceType": "user",
    "resourceId": "123"
  }
}
```

### 3. **Nueva Clase: `VALIDATION_ERROR`**

Para manejar errores de validación complejos:

```javascript
const validationError = new VALIDATION_ERROR({
  detail: "Se encontraron errores de validación en múltiples campos",
  errors: [
    {
      field: "email",
      message: "Formato inválido",
      providedValue: "invalid-email",
      pointer: "#/email"
    },
    {
      field: "age",
      message: "Debe ser un número positivo",
      providedValue: -5,
      pointer: "#/age"
    }
  ]
});
```

### 4. **Middleware para Express**

Nuevo middleware que maneja automáticamente errores RFC 9457:

```javascript
import { problemDetailsHandler } from 'apicustomerrors';

app.use(problemDetailsHandler());
```

---

## ✨ NUEVAS FUNCIONALIDADES

### 1. **Método `toJSON()` Mejorado**

Serialización automática a formato RFC 9457:

```javascript
const error = new BAD_REQUEST_ERROR({
  detail: "Campo requerido faltante",
  extra: { missingField: "email" }
});

console.log(error.toJSON());
// Salida formateada según RFC 9457
```

### 2. **Soporte para Extensiones**

Puedes agregar cualquier información adicional:

```javascript
const error = new ProblemDetailsError({
  type: "https://api.example.com/problems/insufficient-funds",
  title: "Insufficient Funds",
  status: 402,
  detail: "Saldo insuficiente para la transacción",
  extra: {
    currentBalance: 25.50,
    requiredAmount: 100.00,
    suggestedActions: [
      { action: "add_funds", url: "/billing/add-funds" },
      { action: "contact_support", phone: "+1-800-123-4567" }
    ]
  }
});
```

### 3. **URLs de Tipo Personalizables**

Cada error puede tener su propio tipo URI:

```javascript
const error = new BAD_REQUEST_ERROR({
  type: "https://docs.miapi.com/errors/invalid-email-format",
  detail: "El formato del email proporcionado es inválido"
});
```

### 4. **Campo `instance` Automático**

En el middleware de Express, se asigna automáticamente:

```javascript
// Automáticamente asigna req.originalUrl a instance
{
  "instance": "/api/users/123",
  // ... otros campos
}
```

---

## 🆕 NUEVAS CLASES Y FUNCIONES

### Nuevas Exportaciones:

- ✅ `ProblemDetailsError` - Clase base RFC 9457
- ✅ `VALIDATION_ERROR` - Para errores de validación
- ✅ `problemDetailsHandler` - Middleware para Express

### Clases Actualizadas:

Todas las clases existentes ahora extienden `ProblemDetailsError`:

- ✅ `BAD_REQUEST_ERROR`
- ✅ `UNAUTHORIZED_ERROR`
- ✅ `FORBIDDEN_ERROR`
- ✅ `NOT_FOUND_ERROR`
- ✅ `METHOD_NOT_ALLOWED_ERROR`
- ✅ `CONFLICT_ERROR`
- ✅ `UNSUPPORTED_MEDIA_TYPE_ERROR`
- ✅ `TOO_MANY_REQUESTS_ERROR`
- ✅ `INTERNAL_SERVER_ERROR`
- ✅ `SERVICE_UNAVAILABLE_ERROR`

---

## 📚 EJEMPLOS DE USO

### Ejemplo Básico:

```javascript
import { NOT_FOUND_ERROR } from 'apicustomerrors';

app.get('/users/:id', (req, res, next) => {
  const user = database.findUser(req.params.id);
  
  if (!user) {
    const error = new NOT_FOUND_ERROR({
      detail: `Usuario con ID '${req.params.id}' no encontrado`,
      extra: {
        searchedAt: new Date().toISOString(),
        suggestions: [
          { action: "list_all_users", url: "/users" },
          { action: "create_user", url: "/users", method: "POST" }
        ]
      }
    });
    return next(error);
  }
  
  res.json(user);
});
```

### Ejemplo con Express Middleware:

```javascript
import express from 'express';
import { problemDetailsHandler, VALIDATION_ERROR } from 'apicustomerrors';

const app = express();

app.post('/users', (req, res, next) => {
  const errors = validateUserData(req.body);
  
  if (errors.length > 0) {
    const error = new VALIDATION_ERROR({
      detail: "Los datos proporcionados contienen errores",
      errors: errors
    });
    return next(error);
  }
  
  // ... lógica de creación
});

// El middleware maneja automáticamente todos los errores RFC 9457
app.use(problemDetailsHandler());
```

### Ejemplo de Error Personalizado:

```javascript
import { ProblemDetailsError } from 'apicustomerrors';

const businessRuleError = new ProblemDetailsError({
  type: "https://api.miempresa.com/problems/business-rule-violation",
  title: "Business Rule Violation",
  status: 409,
  detail: "La operación viola las reglas de negocio establecidas",
  extra: {
    violatedRules: ["MAX_DAILY_TRANSACTIONS", "FRAUD_DETECTION"],
    remediation: {
      waitTime: "24 hours",
      alternativeActions: ["contact_support", "verify_identity"]
    }
  }
});
```

---

## 🔧 MIGRACIÓN DESDE v1.x

### Cambios Necesarios:

1. **Constructor actualizado:**

```javascript
// ANTES
const error = new NOT_FOUND_ERROR("Usuario no encontrado");

// AHORA
const error = new NOT_FOUND_ERROR({
  detail: "Usuario no encontrado"
});
```

2. **Propiedades cambiadas:**

```javascript
// ANTES
error.statusCode  // ❌ Ya no existe

// AHORA  
error.status      // ✅ Nuevo nombre
error.toJSON()    // ✅ Formato RFC 9457
```

3. **Middleware de Express:**

```javascript
// AÑADIR al final de tus middlewares
app.use(problemDetailsHandler());
```

### Compatibilidad hacia atrás:

- ❌ **NO es compatible** con v1.x debido a cambios arquitectónicos
- ✅ **Migración sencilla** siguiendo los ejemplos
- ✅ **Funcionalidad mejorada** significativamente

---

## 🎯 BENEFICIOS DE LA v2.0.0

### Para Desarrolladores:

- 📋 **Información más rica** en los errores
- 🔧 **Debugging más fácil** con contexto adicional
- 📘 **Documentación automática** de tipos de error
- 🔗 **Enlaces de resolución** integrados

### Para APIs:

- 🌐 **Estándar internacional** RFC 9457
- 🔄 **Interoperabilidad** entre diferentes APIs
- 📱 **Mejor experiencia** para clientes/consumidores
- 🛠️ **Tooling especializado** disponible

### Para Usuarios Finales:

- 💡 **Mensajes más claros** y específicos
- 🔧 **Sugerencias de resolución** incluidas
- 📞 **Información de contacto** cuando sea necesario
- ⏱️ **Timestamps** para seguimiento

---

## 🔗 RECURSOS ADICIONALES

### Documentación:

- [RFC 9457 Specification](https://www.rfc-editor.org/rfc/rfc9457.html)
- [Problem Details Examples](https://www.rfc-editor.org/rfc/rfc9457.html#name-type)
- [HTTP Status Codes Reference](https://httpstatuses.io/)

### Herramientas:

- [JSON Schema para Problem Details](https://json-schema.org/)
- [Validadores online RFC 9457](https://tools.ietf.org/rfc/)

---

## 🐛 BREAKING CHANGES

⚠️ **IMPORTANTE: Esta es una versión con cambios incompatibles**

1. **Constructores cambiados** - Todos los constructores ahora reciben un objeto
2. **Propiedades renombradas** - `statusCode` → `status`
3. **Estructura JSON diferente** - Formato RFC 9457 completo
4. **Import necesario** - Nuevo middleware requerido para Express

---

## 🤝 CONTRIBUCIONES

¡Agradecemos las contribuciones para mejorar esta implementación de RFC 9457!

- 🐛 **Issues**: Reporta bugs o solicita funcionalidades
- 💡 **Pull Requests**: Contribuye con mejoras
- 📖 **Documentación**: Ayuda a mejorar los ejemplos

---

## 📞 SOPORTE

- **Email**: support@apicustomerrors.com  
- **GitHub Issues**: [Crear Issue](https://github.com/programadorisgod/apicustomerrors/issues)
- **Documentación**: [Ver Docs](https://docs.apicustomerrors.com)

---

*Esta versión marca un hito importante en la evolución del paquete, estableciendo las bases para el manejo moderno y estándar de errores en APIs HTTP.*