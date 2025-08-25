import { ProblemDetailsError, BAD_REQUEST_ERROR, NOT_FOUND_ERROR, VALIDATION_ERROR } from 'apicustomerrors';

// ==========================================
// 1. CLASE BASE ProblemDetailsError
// ==========================================

// La nueva clase base que implementa RFC 9457
const customError = new ProblemDetailsError({
  type: "https://example.com/problems/insufficient-funds",
  title: "Insufficient Funds",
  status: 402,
  detail: "Your account balance is insufficient to complete this transaction.",
  instance: "/transactions/abc123",
  errors: null,
  extra: {
    currentBalance: 25.50,
    requiredAmount: 100.00,
    accountId: "user-12345"
  }
});

console.log("=== ProblemDetailsError Básico ===");
console.log(JSON.stringify(customError.toJSON(), null, 2));

// ==========================================
// 2. ERRORES PREDEFINIDOS CON RFC 9457
// ==========================================

// BAD_REQUEST_ERROR con campos RFC 9457
const badRequestError = new BAD_REQUEST_ERROR({
  detail: "El campo 'email' debe ser una dirección de correo válida",
  extra: {
    field: "email",
    providedValue: "invalid-email",
    validationRule: "email-format"
  }
});

console.log("\n=== BAD_REQUEST_ERROR ===");
console.log("Status:", badRequestError.status);
console.log("Type:", badRequestError.type);
console.log("Detail:", badRequestError.detail);
console.log("JSON completo:", JSON.stringify(badRequestError.toJSON(), null, 2));

// NOT_FOUND_ERROR con contexto adicional
const notFoundError = new NOT_FOUND_ERROR({
  detail: "El usuario con ID 12345 no existe en el sistema",
  extra: {
    resourceType: "user",
    resourceId: "12345",
    searchedIn: ["active_users", "inactive_users"],
    suggestions: [
      { action: "check_spelling", message: "Verifica que el ID sea correcto" },
      { action: "contact_admin", message: "Contacta al administrador si el usuario debería existir" }
    ]
  }
});

console.log("\n=== NOT_FOUND_ERROR ===");
console.log(JSON.stringify(notFoundError.toJSON(), null, 2));

// ==========================================
// 3. VALIDATION_ERROR - NUEVO EN v2.0.0
// ==========================================

// Manejo de múltiples errores de validación
const validationError = new VALIDATION_ERROR({
  detail: "La solicitud contiene datos inválidos en múltiples campos",
  errors: [
    {
      field: "age",
      message: "Debe ser un número entero positivo",
      providedValue: -5,
      pointer: "#/age"
    },
    {
      field: "email",
      message: "Formato de email inválido",
      providedValue: "not-an-email",
      pointer: "#/contact/email"
    },
    {
      field: "password",
      message: "Debe contener al menos 8 caracteres, una mayúscula y un número",
      providedValue: "[HIDDEN]",
      pointer: "#/security/password"
    }
  ],
  extra: {
    validationSource: "joi-schema",
    totalErrors: 3,
    requestId: "req-456789"
  }
});

console.log("\n=== VALIDATION_ERROR ===");
console.log(JSON.stringify(validationError.toJSON(), null, 2));

// ==========================================
// 4. COMPARACIÓN: ANTES vs DESPUÉS
// ==========================================

console.log("\n=== COMPARACIÓN: VERSIÓN 1.x vs 2.0.0 ===");

// ANTES (v1.x) - Error simple
console.log("ANTES (v1.x):");
const oldStyleError = {
  name: "NOT_FOUND_ERROR",
  message: "Resource not found",
  statusCode: 404
};
console.log(JSON.stringify(oldStyleError, null, 2));

// AHORA (v2.0.0) - RFC 9457 compliant
console.log("\nAHORA (v2.0.0) - RFC 9457:");
const newStyleError = new NOT_FOUND_ERROR({
  detail: "El recurso solicitado no pudo ser encontrado",
  extra: {
    resourceType: "product",
    resourceId: "prod-123",
    timestamp: new Date().toISOString(),
    correlationId: "corr-789"
  }
});
console.log(JSON.stringify(newStyleError.toJSON(), null, 2));

// ==========================================
// 5. CASOS DE USO AVANZADOS
// ==========================================

// Error con múltiples extensiones
const complexError = new ProblemDetailsError({
  type: "https://api.example.com/problems/business-rule-violation",
  title: "Business Rule Violation",
  status: 409,
  detail: "La operación viola múltiples reglas de negocio",
  instance: "/orders/ord-456",
  errors: [
    { rule: "max-order-limit", message: "Excede el límite máximo de pedido" },
    { rule: "inventory-check", message: "Stock insuficiente" }
  ],
  extra: {
    violatedRules: ["MAX_ORDER_LIMIT", "INVENTORY_AVAILABILITY"],
    suggestedActions: [
      { action: "reduce_quantity", description: "Reducir la cantidad del pedido" },
      { action: "split_order", description: "Dividir en múltiples pedidos" }
    ],
    businessContext: {
      customerId: "cust-789",
      orderValue: 15000,
      maxAllowedValue: 10000,
      availableStock: 5
    }
  }
});

console.log("\n=== ERROR COMPLEJO CON MÚLTIPLES EXTENSIONES ===");
console.log(JSON.stringify(complexError.toJSON(), null, 2));

// Error con enlaces de resolución (RFC 9457 Section 4.2)
const errorWithLinks = new ProblemDetailsError({
  type: "https://api.example.com/problems/payment-required",
  title: "Payment Required",
  status: 402,
  detail: "Se requiere pago para acceder a este recurso premium",
  instance: "/premium-content/article-123",
  extra: {
    requiredPlan: "premium",
    currentPlan: "basic",
    upgradeLinks: {
      monthly: "https://api.example.com/billing/upgrade?plan=premium-monthly",
      yearly: "https://api.example.com/billing/upgrade?plan=premium-yearly"
    },
    trialAvailable: true,
    trialLink: "https://api.example.com/trial/start"
  }
});

console.log("\n=== ERROR CON ENLACES DE RESOLUCIÓN ===");
console.log(JSON.stringify(errorWithLinks.toJSON(), null, 2));
