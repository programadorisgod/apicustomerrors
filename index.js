import statusCodes from "./statusCodes.js"


class CustomError extends Error {
    constructor(message) {
        super(message)
    }
}


export class BAD_REQUEST_ERROR extends CustomError {
    constructor(message) {
        super(message)
        this.name = 'BAD REQUEST ERROR'
        this.stack = null
        this.statusCode = statusCodes.BAD_REQUEST
    }
}

export class UNAUTHORIZED_ERROR extends CustomError {
    constructor(message) {
        super(message)
        this.name = 'UNAUTHORIZED ERROR'
        this.stack = null
        this.statusCode = statusCodes.UNAUTHORIZED
    }
}

export class FORBIDDEN_ERROR extends CustomError {
    constructor(message = "This content is restricted") {
        super(message)
        this.name = 'FORBIDDEN ERROR'
        this.stack = null
        this.statusCode = statusCodes.FORBIDDEN
    }
}

export class NOT_FOUND_ERROR extends CustomError {
    constructor(message = "Content not found") {
        super(message)
        this.name = 'NOT FOUND ERROR'
        this.stack = null
        this.statusCode = statusCodes.NOT_FOUND
    }
}

export class METHOD_NOT_ALLOWED_ERROR extends CustomError {
    constructor(message = "Unsopported operation") {
        super(message)
        this.name = 'METHOD NOT ALOWED'
        this.stack = null
        this.statusCode = statusCodes.METHOD_NOT_ALLOWED
    }
}

export class TOO_MANY_REQUESTS_ERROR extends CustomError {
    constructor(message = "Too many requests") {
        super(message)
        this.name = 'TOO MANY REQUEST'
        this.stack = null
        this.statusCode = statusCodes.TOO_MANY_REQUESTS
    }
}

export class CONFLICT_ERROR extends CustomError {
    constructor(message = "cannot be completed due to a conflict with the current state of the resource on the server. ") {
        super(message)
        this.name = 'CONFLICT ERROR'
        this.stack = null
        this.statusCode = statusCodes.CONFLICT
    }
}       