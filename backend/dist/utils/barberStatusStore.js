"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateBarber = exports.deactivateBarber = exports.getInactiveBarbers = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const storeDir = path_1.default.resolve(process.cwd(), 'data');
const storePath = path_1.default.join(storeDir, 'inactive-barbers.json');
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
const getInactiveBarbers = async () => {
    return readStore();
};
exports.getInactiveBarbers = getInactiveBarbers;
const deactivateBarber = async (barberId) => {
    if (!barberId)
        return;
    const store = await readStore();
    store[String(barberId)] = true;
    await writeStore(store);
};
exports.deactivateBarber = deactivateBarber;
const activateBarber = async (barberId) => {
    if (!barberId)
        return;
    const store = await readStore();
    delete store[String(barberId)];
    await writeStore(store);
};
exports.activateBarber = activateBarber;
