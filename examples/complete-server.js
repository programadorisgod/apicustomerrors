import express from 'express';
import {
  ProblemDetailsError,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
  FORBIDDEN_ERROR,
  NOT_FOUND_ERROR,
  METHOD_NOT_ALLOWED_ERROR,
  CONFLICT_ERROR,
  VALIDATION_ERROR,
  TOO_MANY_REQUESTS_ERROR,
  INTERNAL_SERVER_ERROR,
  SERVICE_UNAVAILABLE_ERROR,
  problemDetailsHandler
} from 'apicustomerrors';

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulación de base de datos en memoria
const users = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "user", credits: 100 },
  { id: 2, name: "María García", email: "maria@example.com", role: "admin", credits: 500 },
  { id: 3, name: "Carlos López", email: "carlos@example.com", role: "user", credits: 25 }
];

const orders = [];
let requestCounts = new Map(); // Para rate limiting

// ==========================================
// MIDDLEWARE PERSONALIZADO
// ==========================================

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 10;

  if (!requestCounts.has(clientIp)) {
    requestCounts.set(clientIp, []);
  }

  const requests = requestCounts.get(clientIp);
  // Filtrar requests dentro de la ventana de tiempo
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    const error = new TOO_MANY_REQUESTS_ERROR({
      detail: `Límite de ${maxRequests} solicitudes por minuto excedido`,
      extra: {
        limit: maxRequests,
        windowMs: windowMs,
        retryAfter: Math.ceil((Math.min(...recentRequests) + windowMs - now) / 1000),
        clientIp: clientIp
      }
    });
    return next(error);
  }

  recentRequests.push(now);
  requestCounts.set(clientIp, recentRequests);
  next();
};

// Middleware de autenticación simulado
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new UNAUTHORIZED_ERROR({
      detail: "Token de autorización Bearer requerido",
      extra: {
        requiredFormat: "Bearer <token>",
        authEndpoint: "/auth/login",
        documentation: "https://docs.api.example.com/authentication",
        supportedMethods: ["Bearer Token", "API Key"]
      }
    });
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  // Simulación de validación de token
  if (token === 'invalid-token') {
    const error = new UNAUTHORIZED_ERROR({
      detail: "Token inválido o expirado",
      extra: {
        tokenStatus: "invalid",
        refreshEndpoint: "/auth/refresh",
        loginEndpoint: "/auth/login"
      }
    });
    return next(error);
  }

  // Simulamos encontrar el usuario por el token
  const userId = token === 'admin-token' ? 2 : 1;
  req.user = users.find(u => u.id === userId);

  next();
};

// Middleware de autorización por rol
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    const error = new FORBIDDEN_ERROR({
      detail: "Se requieren permisos de administrador para acceder a este recurso",
      extra: {
        currentRole: req.user?.role || 'anonymous',
        requiredRole: 'admin',
        contactAdmin: "admin@example.com",
        upgradeInfo: "https://example.com/upgrade-to-admin"
      }
    });
    return next(error);
  }
  next();
};

// ==========================================
// RUTAS PRINCIPALES
// ==========================================

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: "🚀 API Custom Errors v2.0.0 - RFC 9457 Demo Server",
    version: "2.0.0",
    rfc: "9457",
    endpoints: {
      users: "GET/POST /users - Gestión de usuarios",
      orders: "GET/POST /orders - Gestión de pedidos",
      auth: "POST /auth/login - Autenticación",
      admin: "GET /admin/* - Panel administrativo",
      test: "GET /test/* - Endpoints de prueba"
    },
    documentation: "https://github.com/programadorisgod/apicustomerrors"
  });
});

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

// Listar usuarios con paginación
app.get('/users', rateLimitMiddleware, (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (limit > 100) {
    const error = new BAD_REQUEST_ERROR({
      detail: "El límite máximo por página es 100 usuarios",
      extra: {
        providedLimit: limit,
        maxLimit: 100,
        recommendedLimit: 20
      }
    });
    return next(error);
  }

  const paginatedUsers = users.slice(offset, offset + limit);

  res.json({
    users: paginatedUsers,
    pagination: {
      page,
      limit,
      total: users.length,
      pages: Math.ceil(users.length / limit)
    }
  });
});

// Obtener usuario por ID
app.get('/users/:id', rateLimitMiddleware, (req, res, next) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId) || userId <= 0) {
    const error = new BAD_REQUEST_ERROR({
      detail: "El ID de usuario debe ser un número entero positivo",
      extra: {
        providedId: req.params.id,
        expectedType: "positive integer",
        example: "/users/1"
      }
    });
    return next(error);
  }

  const user = users.find(u => u.id === userId);

  if (!user) {
    const error = new NOT_FOUND_ERROR({
      detail: `El usuario con ID ${userId} no existe`,
      extra: {
        resourceType: "user",
        resourceId: userId,
        availableIds: users.map(u => u.id),
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

// Crear nuevo usuario
app.post('/users', rateLimitMiddleware, (req, res, next) => {
  const { name, email, role, credits } = req.body;
  const errors = [];

  // Validación de campos requeridos
  if (!name || name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "El nombre es obligatorio y no puede estar vacío",
      providedValue: name,
      pointer: "#/name",
      rule: "required"
    });
  } else if (name.length < 2 || name.length > 100) {
    errors.push({
      field: "name",
      message: "El nombre debe tener entre 2 y 100 caracteres",
      providedValue: name,
      pointer: "#/name",
      rule: "length",
      constraints: { min: 2, max: 100 }
    });
  }

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.push({
      field: "email",
      message: "El email es obligatorio",
      providedValue: email,
      pointer: "#/email",
      rule: "required"
    });
  } else if (!emailRegex.test(email)) {
    errors.push({
      field: "email",
      message: "El formato del email es inválido",
      providedValue: email,
      pointer: "#/email",
      rule: "email-format"
    });
  } else if (users.some(u => u.email === email)) {
    errors.push({
      field: "email",
      message: "Ya existe un usuario con este email",
      providedValue: email,
      pointer: "#/email",
      rule: "unique"
    });
  }

  // Validación de rol
  const validRoles = ['user', 'admin'];
  if (role && !validRoles.includes(role)) {
    errors.push({
      field: "role",
      message: "El rol debe ser 'user' o 'admin'",
      providedValue: role,
      pointer: "#/role",
      rule: "enum",
      allowedValues: validRoles
    });
  }

  // Validación de créditos
  if (credits !== undefined) {
    if (typeof credits !== 'number' || credits < 0) {
      errors.push({
        field: "credits",
        message: "Los créditos deben ser un número mayor o igual a 0",
        providedValue: credits,
        pointer: "#/credits",
        rule: "positive-number"
      });
    } else if (credits > 10000) {
      errors.push({
        field: "credits",
        message: "Los créditos no pueden exceder 10,000",
        providedValue: credits,
        pointer: "#/credits",
        rule: "max-value",
        constraints: { max: 10000 }
      });
    }
  }

  // Si hay errores de validación
  if (errors.length > 0) {
    const error = new VALIDATION_ERROR({
      detail: `Se encontraron ${errors.length} errores de validación`,
      errors: errors,
      extra: {
        totalErrors: errors.length,
        providedFields: Object.keys(req.body),
        requiredFields: ["name", "email"],
        optionalFields: ["role", "credits"]
      }
    });
    return next(error);
  }

  // Crear el usuario
  const newUser = {
    id: users.length + 1,
    name: name.trim(),
    email: email.toLowerCase(),
    role: role || 'user',
    credits: credits || 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  res.status(201).json({
    message: "Usuario creado exitosamente",
    user: newUser
  });
});

// ==========================================
// GESTIÓN DE PEDIDOS
// ==========================================

// Crear pedido
app.post('/orders', authMiddleware, rateLimitMiddleware, (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  // Validación básica
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new BAD_REQUEST_ERROR({
      detail: "Se requiere al menos un item en el pedido",
      extra: {
        providedItems: items,
        expectedFormat: [
          { productId: "string", quantity: "number", price: "number" }
        ]
      }
    });
    return next(error);
  }

  // Calcular total
  let total = 0;
  try {
    total = items.reduce((sum, item) => {
      if (!item.price || !item.quantity) {
        throw new Error("Datos de item inválidos");
      }
      return sum + (item.price * item.quantity);
    }, 0);
  } catch (err) {
    const error = new BAD_REQUEST_ERROR({
      detail: "Todos los items deben tener precio y cantidad válidos",
      extra: {
        invalidItems: items.filter(item => !item.price || !item.quantity)
      }
    });
    return next(error);
  }

  // Validar créditos suficientes
  if (req.user.credits < total) {
    const error = new ProblemDetailsError({
      type: "https://api.example.com/problems/insufficient-credits",
      title: "Insufficient Credits",
      status: 402,
      detail: "No tiene suficientes créditos para completar este pedido",
      errors: [
        {
          rule: "sufficient-credits",
          message: `Se requieren ${total} créditos, pero solo tiene ${req.user.credits}`,
          required: total,
          available: req.user.credits,
          deficit: total - req.user.credits
        }
      ],
      extra: {
        userId: req.user.id,
        orderTotal: total,
        currentCredits: req.user.credits,
        missingCredits: total - req.user.credits,
        suggestedActions: [
          {
            action: "purchase_credits",
            url: "/billing/purchase-credits",
            description: "Comprar más créditos"
          },
          {
            action: "reduce_order",
            description: "Reducir la cantidad de items",
            maxAffordableTotal: req.user.credits
          }
        ]
      }
    });
    return next(error);
  }

  // Validar límite de pedido
  if (total > 1000) {
    const error = new CONFLICT_ERROR({
      detail: "El valor del pedido excede el límite máximo permitido",
      extra: {
        orderTotal: total,
        maxOrderValue: 1000,
        excess: total - 1000,
        userLevel: req.user.role,
        upgradeOptions: req.user.role === 'user' ? {
          adminUpgrade: "Los administradores pueden hacer pedidos de hasta $5,000",
          contactSales: "sales@example.com"
        } : null
      }
    });
    return next(error);
  }

  // Crear el pedido
  const newOrder = {
    id: orders.length + 1,
    userId: req.user.id,
    items,
    total,
    shippingAddress,
    paymentMethod: paymentMethod || 'credits',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);

  // Descontar créditos
  req.user.credits -= total;

  res.status(201).json({
    message: "Pedido creado exitosamente",
    order: newOrder,
    remainingCredits: req.user.credits
  });
});

// ==========================================
// AUTENTICACIÓN
// ==========================================

app.post('/auth/login', rateLimitMiddleware, (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new BAD_REQUEST_ERROR({
      detail: "Email y contraseña son requeridos",
      extra: {
        requiredFields: ["email", "password"],
        providedFields: Object.keys(req.body)
      }
    });
    return next(error);
  }

  // Simulación de autenticación
  const user = users.find(u => u.email === email);

  if (!user) {
    const error = new UNAUTHORIZED_ERROR({
      detail: "Credenciales inválidas",
      extra: {
        loginAttempts: 1,
        maxAttempts: 5,
        lockoutWarning: "La cuenta se bloqueará después de 5 intentos fallidos",
        forgotPasswordUrl: "/auth/forgot-password"
      }
    });
    return next(error);
  }

  // Tokens simulados
  const token = user.role === 'admin' ? 'admin-token' : 'user-token';

  res.json({
    message: "Autenticación exitosa",
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    expiresIn: "24h"
  });
});

// ==========================================
// PANEL ADMINISTRATIVO
// ==========================================

app.get('/admin/users', authMiddleware, requireAdmin, (req, res) => {
  res.json({
    message: "Panel administrativo - Usuarios",
    users: users,
    statistics: {
      totalUsers: users.length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      regularUsers: users.filter(u => u.role === 'user').length,
      totalCredits: users.reduce((sum, u) => sum + u.credits, 0)
    }
  });
});

app.get('/admin/orders', authMiddleware, requireAdmin, (req, res) => {
  res.json({
    message: "Panel administrativo - Pedidos",
    orders: orders,
    statistics: {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
    }
  });
});

// ==========================================
// ENDPOINTS DE PRUEBA
// ==========================================

// Test de error interno
app.get('/test/internal-error', (req, res, next) => {
  const error = new INTERNAL_SERVER_ERROR({
    detail: "Este es un error interno simulado para pruebas",
    extra: {
      errorCode: "TEST_ERROR_001",
      timestamp: new Date().toISOString(),
      requestId: `req-${Date.now()}`,
      supportInfo: {
        email: "support@example.com",
        phone: "+1-800-123-4567",
        statusPage: "https://status.example.com"
      }
    }
  });
  next(error);
});

// Test de servicio no disponible
app.get('/test/service-unavailable', (req, res, next) => {
  const error = new SERVICE_UNAVAILABLE_ERROR({
    detail: "El servicio está temporalmente no disponible por mantenimiento",
    extra: {
      maintenanceWindow: {
        start: "2023-10-15T02:00:00Z",
        end: "2023-10-15T04:00:00Z"
      },
      estimatedRecovery: "2023-10-15T04:00:00Z",
      alternativeEndpoints: [
        "https://backup.api.example.com",
        "https://mirror.api.example.com"
      ],
      statusPage: "https://status.example.com"
    }
  });
  next(error);
});

// Test de método no permitido
app.post('/test/method-not-allowed', (req, res, next) => {
  const error = new METHOD_NOT_ALLOWED_ERROR({
    detail: "El método POST no está permitido en este endpoint",
    extra: {
      allowedMethods: ["GET", "PUT", "DELETE"],
      providedMethod: "POST",
      correctEndpoints: {
        "POST": "/test/create-resource",
        "GET": "/test/method-not-allowed"
      }
    }
  });
  next(error);
});

// Test de error personalizado complejo
app.get('/test/complex-error', (req, res, next) => {
  const error = new ProblemDetailsError({
    type: "https://api.example.com/problems/complex-business-rule",
    title: "Complex Business Rule Violation",
    status: 409,
    detail: "Esta operación viola múltiples reglas de negocio establecidas",
    errors: [
      {
        rule: "time-window",
        message: "Operación fuera del horario permitido",
        currentTime: "22:30",
        allowedWindow: "08:00 - 22:00"
      },
      {
        rule: "user-level",
        message: "Nivel de usuario insuficiente",
        currentLevel: "bronze",
        requiredLevel: "gold"
      },
      {
        rule: "geographic-restriction",
        message: "Operación no permitida desde esta ubicación",
        currentLocation: "restricted-region",
        allowedRegions: ["us-east", "eu-west", "asia-pacific"]
      }
    ],
    extra: {
      violatedRules: 3,
      severity: "high",
      businessContext: {
        operationType: "premium-feature-access",
        userId: 1,
        userLevel: "bronze",
        location: "restricted-region"
      },
      remediation: {
        immediateActions: [
          "Wait until business hours (08:00 - 22:00)",
          "Upgrade to Gold level membership",
          "Use VPN to access from allowed region"
        ],
        escalation: {
          supportEmail: "business-rules@example.com",
          escalationLevel: "senior-support"
        }
      },
      relatedDocumentation: [
        "https://docs.example.com/business-rules",
        "https://docs.example.com/user-levels",
        "https://docs.example.com/geographic-policies"
      ]
    }
  });
  next(error);
});

// ==========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ==========================================

// Middleware para rutas no encontradas
app.use('*', (req, res, next) => {
  const error = new NOT_FOUND_ERROR({
    detail: `La ruta '${req.method} ${req.originalUrl}' no existe`,
    extra: {
      method: req.method,
      path: req.originalUrl,
      availableRoutes: [
        "GET / - Información de la API",
        "GET /users - Listar usuarios",
        "POST /users - Crear usuario",
        "GET /users/:id - Obtener usuario",
        "POST /orders - Crear pedido",
        "POST /auth/login - Iniciar sesión",
        "GET /admin/* - Panel administrativo",
        "GET /test/* - Endpoints de prueba"
      ],
      documentation: "https://docs.api.example.com",
      supportContact: "api-support@example.com"
    }
  });
  next(error);
});

// Middleware principal de manejo de errores RFC 9457
app.use(problemDetailsHandler());

// Middleware de respaldo para errores no capturados
app.use((err, req, res, next) => {
  console.error('❌ Error no capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Si no es un ProblemDetailsError, lo convertimos
  if (!(err instanceof ProblemDetailsError)) {
    const internalError = new INTERNAL_SERVER_ERROR({
      detail: "Ocurrió un error interno inesperado",
      extra: {
        errorType: err.constructor.name,
        originalMessage: err.message,
        requestInfo: {
          method: req.method,
          url: req.originalUrl,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        },
        supportInfo: {
          contactEmail: "support@example.com",
          incidentId: `inc-${Date.now()}`,
          reportBugUrl: "https://github.com/programadorisgod/apicustomerrors/issues"
        }
      }
    });

    return res.status(500).json(internalError.toJSON());
  }

  next(err);
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 API Custom Errors v2.0.0 - RFC 9457 Demo Server
📡 Servidor corriendo en puerto ${PORT}
🌐 URL: http://localhost:${PORT}

📚 ENDPOINTS DISPONIBLES:

🏠 GENERAL:
   GET  /                           - Información de la API

👥 USUARIOS:
   GET  /users                      - Listar usuarios (con paginación)
   GET  /users/:id                  - Obtener usuario por ID
   POST /users                      - Crear nuevo usuario

🛒 PEDIDOS:
   POST /orders                     - Crear pedido (requiere auth)

🔐 AUTENTICACIÓN:
   POST /auth/login                 - Iniciar sesión

   Usuarios de prueba:
   - admin: maria@example.com (token: admin-token)
   - user:  juan@example.com  (token: user-token)

👑 ADMIN (requiere auth + rol admin):
   GET  /admin/users               - Panel de usuarios
   GET  /admin/orders              - Panel de pedidos

🧪 PRUEBAS DE ERRORES:
   GET  /test/internal-error       - Error interno (500)
   GET  /test/service-unavailable  - Servicio no disponible (503)
   POST /test/method-not-allowed   - Método no permitido (405)
   GET  /test/complex-error        - Error complejo personalizado

🎯 EJEMPLOS DE PRUEBA:

   curl -X POST http://localhost:${PORT}/users \\
        -H "Content-Type: application/json" \\
        -d '{"name":"","email":"invalid"}'

   curl -X GET http://localhost:${PORT}/users/999

   curl -X GET http://localhost:${PORT}/admin/users

   curl -X POST http://localhost:${PORT}/orders \\
        -H "Authorization: Bearer user-token" \\
        -H "Content-Type: application/json" \\
        -d '{"items":[{"productId":"1","quantity":2,"price":600}]}'

✨ Todos los errores siguen RFC 9457 Problem Details for HTTP APIs!
📖 Documentación: https://www.rfc-editor.org/rfc/rfc9457.html
  `);
});

export default app;
