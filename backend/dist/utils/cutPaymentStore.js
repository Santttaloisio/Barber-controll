"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCutPaymentMethods = exports.saveCutPaymentMethod = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const storeDir = path_1.default.resolve(process.cwd(), 'data');
const storePath = path_1.default.join(storeDir, 'cut-payment-methods.json');
const readStore = async () => {
    try {
        const content = await fs_1.promises.readFile(storePath, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return {};
    }
};
const writeStore = async (store) => {
    await fs_1.promises.mkdir(storeDir, { recursive: true });
    await fs_1.promises.writeFile(storePath, JSON.stringify(store, null, 2));
};
const saveCutPaymentMethod = async (cutId, paymentMethod) => {
    const cleanPaymentMethod = paymentMethod?.trim();
    if (!cutId || !cleanPaymentMethod)
        return;
    const store = await readStore();
    store[String(cutId)] = cleanPaymentMethod;
    await writeStore(store);
};
exports.saveCutPaymentMethod = saveCutPaymentMethod;
const getCutPaymentMethods = async () => {
    return readStore();
};
exports.getCutPaymentMethods = getCutPaymentMethods;
