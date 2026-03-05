export class AppError extends Error{
    public readonly statusCode:number;
    public readonly isOperational:boolean;
    constructor(message:string,statusCode:number=500,isisOperational=true){
        super(message);
        this.statusCode=statusCode;
        this.isOperational=isisOperational
        Object.setPrototypeOf(this,AppError.prototype)
        Error.captureStackTrace(this,this.constructor)
    }
}

export class ValidationError extends AppError{
    constructor(message:string){
        super(message,400)
    }
}

export class NotFoundError extends AppError{
    constructor(message:string='Resource Not Found'){
        super(message,404)
    }
}

export class UnauthorizedError extends AppError{
    constructor(message:string='Un Authorized Accesss'){
       super(message,401)
    }
}
export class ForbiddenError extends AppError{
    constructor(message:string="Access ForBidden"){
        super(message,403);
    }
}
export class ConflictError extends AppError{
    constructor(message:string='Resource allready exist'){
        super(message,409)
    }
}

export class BadRequestError extends AppError{
    constructor(message:string='Bad request'){
        super(message,400)
    }
}