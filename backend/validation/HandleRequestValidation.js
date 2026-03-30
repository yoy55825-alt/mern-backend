import {validationResult} from "express-validator"

const HandleRequestValidation = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.mapped() }); 
    }

    return next(); 
};

export default HandleRequestValidation;