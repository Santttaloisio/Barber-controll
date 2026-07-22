"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), '.env')
});
const supabaseUrl = 'https://zwhdhmrcpqddvoemewim.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY?.trim();
if (!supabaseKey) {
    throw new Error('SUPABASE_KEY no está definida en el .env');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    },
    global: {
        headers: {
            Authorization: `Bearer ${supabaseKey}`
        }
    }
});
