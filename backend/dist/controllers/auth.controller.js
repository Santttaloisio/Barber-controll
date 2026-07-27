"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jwt_1 = require("../utils/jwt");
const getAuthConfig = () => ({
    username: process.env.AUTH_USERNAME ?? 'Adminwest',
    password: process.env.AUTH_PASSWORD ?? 'admin123',
    name: process.env.AUTH_NAME ?? 'Administrador'
});
const login = (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: 'Faltan datos' });
        }
        const auth = getAuthConfig();
        const isValid = username.trim() === auth.username && password === auth.password;
        if (!isValid) {
            return res.status(401).json({ message: 'Credenciales invalidas' });
        }
        const token = (0, jwt_1.signToken)({
            sub: auth.username,
            username: auth.username,
            name: auth.name
        });
        return res.json({
            token,
            user: {
                username: auth.username,
                name: auth.name
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al iniciar sesion' });
    }
};
exports.login = login;
