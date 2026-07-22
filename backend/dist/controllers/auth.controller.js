"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jwt_1 = require("../utils/jwt");
const getAuthConfig = () => {
    return {
        username: process.env.AUTH_USERNAME ?? process.env.AUTH_EMAIL ?? 'Adminwest',
        password: process.env.AUTH_PASSWORD ?? 'admin123',
        name: process.env.AUTH_NAME ?? 'Administrador'
    };
};
const login = (req, res) => {
    const { username, email, password } = req.body;
    const auth = getAuthConfig();
    const loginName = username ?? email;
    if (loginName !== auth.username || password !== auth.password) {
        return res.status(401).json({ message: 'Credenciales invalidas' });
    }
    const user = {
        username: auth.username,
        name: auth.name
    };
    const token = (0, jwt_1.signToken)({
        sub: auth.username,
        username: auth.username,
        name: auth.name
    });
    return res.json({ token, user });
};
exports.login = login;
