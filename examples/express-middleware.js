import express from 'express';
import {
  ProblemDetailsError,
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  UNAUTHORIZED_ERROR,
  VALIDATION_ERROR,
  INTERNAL_SERVER_ERROR,
  problemDetailsHandler
} from 'apicustomerrors';

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// ==========================================
// EJEMPLOS DE RUTAS CON ERRORES RFC 9457
// ==========================================

// Ruta que demuestra BAD_REQUEST_ERROR
app.post('/users', (req, res, next) => {
  const { name, email, age } = req.body;

  if (!name || !email) {
    const error = new BAD_REQUEST_ERROR({
      detail: "Los campos 'name' y 'email' son obligatorios",
      extra: {
        missingFields: [
          ...(name ? [] : ['name']),
          ...(email ? [] : ['email'])
        ],
        providedFields: Object.keys(req.body),
        requestId: `req-${Date.now()}`
      }
    });
    return next(error);
  }

  // Simulamos creación exitosa
  res.status(201).json({
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    age,
    created: new Date().toISOString()
  });
});

// Ruta que demuestra NOT_FOUND_ERROR
app.get('/users/:id', (req, res, next) => {
  const userId = req.params.id;

  // Simulamos que el usuario no existe
  if (userId === '999') {
    const error = new NOT_FOUND_ERROR({
      detail: `El usuario con ID '${userId}' no existe en el sistema`,
      extra: {
        resourceType: 'user',
        resourceId: userId,
        searchedAt: new Date().toISOString(),
        suggestions: [
          {
            action: 'list_users',
            url: '/users',
            description: 'Ver todos los usuarios disponibles'
          },
          {
            action: 'create_user',
            url: '/users',
            method: 'POST',
            description: 'Crear un nuevo usuario'
          }
        ]
      }
    });
    return next(error);
  }

  // Simulamos usuario encontrado
  res.json({
    id: userId,
    name: `Usuario ${userId}`,
    email: `user${userId}@example.com`
  });
});

// Ruta que demuestra UNAUTHORIZED_ERROR
app.get('/admin/dashboard', (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new UNAUTHORIZED_ERROR({
      detail: "Token de autorización requerido para acceder a recursos administrativos",
      extra: {
        requiredAuth: 'Bearer token',
        authMethods: ['JWT', 'OAuth2'],
        loginUrl: 'https://api.example.com/auth/login',
        documentationUrl: 'https://docs.example.com/auth'
      }
    });
    return next(error);
  }

  res.json({ message: 'Panel administrativo' });
});

// Ruta que demuestra VALIDATION_ERROR con múltiples errores
app.put('/users/:id/profile', (req, res, next) => {
  const { age, email, phone, preferences } = req.body;
  const errors = [];

  // Validación de edad
  if (age !== undefined) {
    if (typeof age !== 'number' || age < 0 || age > 150) {
      errors.push({
        field: 'age',
        message: 'La edad debe ser un número entre 0 y 150',
        providedValue: age,
        pointer: '#/age',
        rule: 'age-range'
      });
    }
  }

  // Validación de email
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        message: 'El formato del email es inválido',
        providedValue: email,
        pointer: '#/email',
        rule: 'email-format'
      });
    }
  }

  // Validación de teléfono
  if (phone !== undefined) {
    if (typeof phone !== 'string' || phone.length < 10) {
      errors.push({
        field: 'phone',
        message: 'El teléfono debe tener al menos 10 caracteres',
        providedValue: phone,
        pointer: '#/phone',
        rule: 'phone-length'
      });
    }
  }

  // Validación de preferencias
  if (preferences !== undefined) {
    if (typeof preferences !== 'object' || Array.isArray(preferences)) {
      errors.push({
        field: 'preferences',
        message: 'Las preferencias deben ser un objeto',
        providedValue: typeof preferences,
        pointer: '#/preferences',
        rule: 'object-type'
      });
    }
  }

  // Si hay errores de validación, lanzamos VALIDATION_ERROR
  if (errors.length > 0) {
    const validationError = new VALIDATION_ERROR({
      detail: `Se encontraron ${errors.length} errores de validación en los datos proporcionados`,
      errors: errors,
      extra: {
        totalErrors: errors.length,
        validationStrategy: 'field-by-field',
        timestamp: new Date().toISOString(),
        requestPayload: {
          fieldsProvided: Object.keys(req.body),
          fieldsWithErrors: errors.map(e => e.field)
        }
      }
    });
    return next(validationError);
  }

  // Simulamos actualización exitosa
  res.json({
    message: 'Perfil actualizado exitosamente',
    updatedFields: Object.keys(req.body),
    timestamp: new Date().toISOString()
  });
});

// Ruta que demuestra error personalizado con ProblemDetailsError
app.post('/orders', (req, res, next) => {
  const { items, shippingAddress } = req.body;

  // Simulamos validación de reglas de negocio
  const totalValue = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  if (totalValue > 10000) {
    const error = new ProblemDetailsError({
      type: "https://api.example.com/problems/order-limit-exceeded",
      title: "Order Limit Exceeded",
      status: 409,
      detail: "El valor total del pedido excede el límite máximo permitido",
      instance: req.originalUrl,
      errors: [
        {
          rule: 'max-order-value',
          message: 'El valor máximo por pedido es $10,000',
          currentValue: totalValue,
          maxValue: 10000
        }
      ],
      extra: {
        orderSummary: {
          itemCount: items?.length || 0,
          totalValue: totalValue,
          limit: 10000,
          excess: totalValue - 10000
        },
        suggestedActions: [
          {
            action: 'split_order',
            description: 'Dividir el pedido en múltiples órdenes más pequeñas',
            maxSuggestedValue: 10000
          },
          {
            action: 'remove_items',
            description: 'Remover algunos artículos para reducir el total',
            itemsToRemove: Math.ceil((totalValue - 10000) / 100)
          },
          {
            action: 'contact_sales',
            description: 'Contactar al equipo de ventas para pedidos grandes',
            contact: 'sales@example.com'
          }
        ]
      }
    });
    return next(error);
  }

  res.status(201).json({
    orderId: `order-${Date.now()}`,
    status: 'pending',
    totalValue: totalValue,
    estimatedDelivery: '3-5 business days'
  });
});

// Ruta que simula un error interno del servidor
app.get('/crash-test', (req, res, next) => {
  // Simulamos un error inesperado
  const error = new INTERNAL_SERVER_ERROR({
    detail: "Ocurrió un error inesperado en el procesamiento interno",
    extra: {
      errorId: `err-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      contactSupport: 'support@example.com',
      statusPage: 'https://status.example.com'
    }
  });
  next(error);
});

// ==========================================
// MIDDLEWARE DE MANEJO DE ERRORES RFC 9457
// ==========================================

// El middleware problemDetailsHandler debe ir DESPUÉS de todas las rutas
app.use(problemDetailsHandler());

// Middleware adicional para errores no capturados
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Si no es un ProblemDetailsError, lo convertimos
  if (!(err instanceof ProblemDetailsError)) {
    const internalError = new INTERNAL_SERVER_ERROR({
      detail: "Ocurrió un error interno inesperado",
      extra: {
        originalError: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
      }
    });
    return res.status(500).json(internalError.toJSON());
  }

  next(err);
});

// Middleware para rutas no encontradas
app.use('*', (req, res, next) => {
  const error = new NOT_FOUND_ERROR({
    detail: `La ruta '${req.originalUrl}' no existe en esta API`,
    extra: {
      method: req.method,
      path: req.originalUrl,
      availableEndpoints: [
        'POST /users - Crear usuario',
        'GET /users/:id - Obtener usuario',
        'GET /admin/dashboard - Panel admin',
        'PUT /users/:id/profile - Actualizar perfil',
        'POST /orders - Crear pedido'
      ],
      documentation: 'https://docs.example.com/api'
    }
  });
  next(error);
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log('\n📚 Endpoints de prueba:');
  console.log('POST   /users - Crear usuario (prueba con body vacío para ver BAD_REQUEST)');
  console.log('GET    /users/999 - Ver usuario inexistente (NOT_FOUND)');
  console.log('GET    /admin/dashboard - Sin auth (UNAUTHORIZED)');
  console.log('PUT    /users/1/profile - Con datos inválidos (VALIDATION_ERROR)');
  console.log('POST   /orders - Con valor alto (custom error)');
  console.log('GET    /crash-test - Error interno (INTERNAL_SERVER_ERROR)');
  console.log('GET    /ruta-inexistente - Cualquier ruta (NOT_FOUND)');
  console.log('\n✨ Todos los errores siguen RFC 9457 Problem Details!');
});

export default app;

// ==========================================
// EJEMPLOS DE RESPUESTAS RFC 9457
// ==========================================

/*
EJEMPLO 1 - BAD_REQUEST_ERROR:
POST /users (sin body)

HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://httpstatuses.io/400",
  "title": "Bad Request",
  "status": 400,
  "detail": "Los campos 'name' y 'email' son obligatorios",
  "instance": "/users",
  "extra": {
    "missingFields": ["name", "email"],
    "providedFields": [],
    "requestId": "req-1634567890123"
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}

EJEMPLO 2 - VALIDATION_ERROR:
PUT /users/1/profile
{
  "age": -5,
  "email": "invalid-email",
  "phone": "123"
}

HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://httpstatuses.io/422",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "Se encontraron 3 errores de validación en los datos proporcionados",
  "instance": "/users/1/profile",
  "errors": [
    {
      "field": "age",
      "message": "La edad debe ser un número entre 0 y 150",
      "providedValue": -5,
      "pointer": "#/age",
      "rule": "age-range"
    },
    {
      "field": "email",
      "message": "El formato del email es inválido",
      "providedValue": "invalid-email",
      "pointer": "#/email",
      "rule": "email-format"
    },
    {
      "field": "phone",
      "message": "El teléfono debe tener al menos 10 caracteres",
      "providedValue": "123",
      "pointer": "#/phone",
      "rule": "phone-length"
    }
  ],
  "extra": {
    "totalErrors": 3,
    "validationStrategy": "field-by-field",
    "timestamp": "2023-10-15T10:30:00.123Z",
    "requestPayload": {
      "fieldsProvided": ["age", "email", "phone"],
      "fieldsWithErrors": ["age", "email", "phone"]
    }
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}

EJEMPLO 3 - Error Personalizado:
POST /orders (con valor > $10,000)

HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "type": "https://api.example.com/problems/order-limit-exceeded",
  "title": "Order Limit Exceeded",
  "status": 409,
  "detail": "El valor total del pedido excede el límite máximo permitido",
  "instance": "/orders",
  "errors": [
    {
      "rule": "max-order-value",
      "message": "El valor máximo por pedido es $10,000",
      "currentValue": 15000,
      "maxValue": 10000
    }
  ],
  "extra": {
    "orderSummary": {
      "itemCount": 5,
      "totalValue": 15000,
      "limit": 10000,
      "excess": 5000
    },
    "suggestedActions": [
      {
        "action": "split_order",
        "description": "Dividir el pedido en múltiples órdenes más pequeñas",
        "maxSuggestedValue": 10000
      },
      {
        "action": "remove_items",
        "description": "Remover algunos artículos para reducir el total",
        "itemsToRemove": 50
      },
      {
        "action": "contact_sales",
        "description": "Contactar al equipo de ventas para pedidos grandes",
        "contact": "sales@example.com"
      }
    ]
  },
  "timestamp": "2023-10-15T10:30:00.123Z"
}
*/
