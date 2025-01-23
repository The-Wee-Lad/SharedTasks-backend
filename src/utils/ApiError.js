export class ApiError extends Error{
    constructor(statusCode, message, cause, stack, name = "Error"){
        super(message)
        this.statusCode = statusCode,
        this.cause = cause,
        this.message = message,
        this.name = name;
        if(stack)
            this.stack = stack;
        else
            Error.captureStackTrace(this, this.constructor);
    }
}