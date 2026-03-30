// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

export const protect = async (req, res, next) => {
    let token;
    
    console.log('=== AUTH DEBUG ===');
    console.log('Authorization header:', req.headers.authorization);
    console.log('Cookies:', req.cookies);
    
    // Check for token in Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token found in Authorization header');
    }
    // If no token in header, check for token in cookie
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('Token found in cookie');
    }
    
    if (!token) {
        console.log('No token found');
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('User authenticated:', req.user.email);
        next();
        
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired, please login again'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};