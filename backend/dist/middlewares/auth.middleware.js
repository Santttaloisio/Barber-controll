"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ')
        ? header.slice('Bearer '.length)
        : null;
    if (!token || !(0, jwt_1.verifyToken)(token)) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    return next();
};
exports.requireAuth = requireAuth;
