export const notFoundError = (req, res, next) => {
    const error: any = new Error("Not Found!");
    error.status = 404;
    next(error);
};

export const errorHandler = (error, req, res, next) => {
    return res.status(error.status || 500).json({
        message: error.message,
        status: error.status,
        stack: error.stack
    });
};

