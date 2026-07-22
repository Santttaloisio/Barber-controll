"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingMigrationResponse = exports.isMissingColumnError = void 0;
const isMissingColumnError = (error) => {
    const message = String(error?.message ?? error?.details ?? '');
    return error?.code === 'PGRST204'
        || message.includes('Could not find')
        || message.includes('column');
};
exports.isMissingColumnError = isMissingColumnError;
const missingMigrationResponse = (res, table) => {
    return res.status(400).json({
        message: `Faltan columnas en la tabla ${table}. Ejecuta backend/supabase-migration.sql en Supabase.`
    });
};
exports.missingMigrationResponse = missingMigrationResponse;
