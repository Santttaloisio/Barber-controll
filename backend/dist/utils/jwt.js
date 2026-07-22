"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const base64Url = (value) => {
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};
const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET no esta definido');
    }
    return secret ?? 'dev-secret-change-me';
};
const signPart = (value) => {
    return base64Url(crypto_1.default
        .createHmac('sha256', getSecret())
        .update(value)
        .digest());
};
const signToken = (payload) => {
    const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64Url(JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    }));
    const signature = signPart(`${header}.${body}`);
    return `${header}.${body}.${signature}`;
};
exports.signToken = signToken;
const verifyToken = (token) => {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature)
        return null;
    const expectedSignature = signPart(`${header}.${body}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (signatureBuffer.length !== expectedBuffer.length
        || !crypto_1.default.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return null;
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000))
        return null;
    return payload;
};
exports.verifyToken = verifyToken;
