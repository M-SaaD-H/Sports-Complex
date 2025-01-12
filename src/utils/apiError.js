class ApiError extends Error {
    constructor(
        statusCode,
        message = "Somthing went wrong",
        errors = [],
        stack
    ) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.data = null;
        this.errors = errors;
        this.success = false;

        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constuctor);
        }
    }
}

export { ApiError }