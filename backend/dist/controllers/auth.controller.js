"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jwt_1 = require("../utils/jwt");
const getAuthConfig = () => {
    return {
        email: process.env.AUTH_EMAIL ?? 'admin@barber.local',
        password: process.env.AUTH_PASSWORD ?? 'admin123',
        name: process.env.AUTH_NAME ?? 'Administrador'
    };
};
const login = (req, res) => {
    const { email, password } = req.body;
    const auth = getAuthConfig();
    if (email !== auth.email || password !== auth.password) {
        return res.status(401).json({ message: 'Credenciales invalidas' });
    }
    const user = {
        email: auth.email,
        name: auth.name
    };
    const token = (0, jwt_1.signToken)({
        sub: auth.email,
        email: auth.email,
        name: auth.name
    });
    return res.json({ token, user });
};
exports.login = login;
