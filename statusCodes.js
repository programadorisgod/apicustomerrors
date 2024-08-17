const StatusCodes = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNSUPPORTED_MEDIA_TYPE: 415,  
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,  
    SERVICE_UNAVAILABLE: 503,  
};

export default Object.freeze(
    StatusCodes
)