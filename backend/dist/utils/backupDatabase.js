"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAutomaticBackups = exports.createDatabaseBackup = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const getBackupDirectory = () => {
    return path_1.default.resolve(process.cwd(), 'backups');
};
const getDateParts = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}-${minutes}-${seconds}`
    };
};
const getPgDumpPath = () => {
    return process.env.PG_DUMP_PATH || 'pg_dump';
};
const getRetentionDays = () => {
    return Number(process.env.BACKUP_RETENTION_DAYS ?? 30);
};
const removeOldBackups = async () => {
    const backupDirectory = getBackupDirectory();
    const retentionDays = getRetentionDays();
    const maxAge = retentionDays * ONE_DAY_IN_MS;
    const now = Date.now();
    const files = await promises_1.default.readdir(backupDirectory);
    await Promise.all(files.map(async (file) => {
        if (!file.endsWith('.backup'))
            return;
        const filePath = path_1.default.join(backupDirectory, file);
        const stats = await promises_1.default.stat(filePath);
        const fileAge = now - stats.mtime.getTime();
        if (fileAge > maxAge) {
            await promises_1.default.unlink(filePath);
            console.log(`Backup viejo eliminado: ${file}`);
        }
    }));
};
const backupAlreadyExistsToday = async () => {
    const backupDirectory = getBackupDirectory();
    const { date } = getDateParts();
    try {
        const files = await promises_1.default.readdir(backupDirectory);
        return files.some((file) => {
            return file.startsWith(`barber_control_${date}`) && file.endsWith('.backup');
        });
    }
    catch (error) {
        return false;
    }
};
const createDatabaseBackup = async () => {
    const dbName = process.env.DB_NAME;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST ?? 'localhost';
    const dbPort = process.env.DB_PORT ?? '5432';
    if (!dbName || !dbUser || !dbPassword) {
        throw new Error('Faltan datos de conexión en el archivo .env para crear el backup');
    }
    const backupDirectory = getBackupDirectory();
    await promises_1.default.mkdir(backupDirectory, {
        recursive: true
    });
    const { date, time } = getDateParts();
    const backupFileName = `barber_control_${date}_${time}.backup`;
    const backupFilePath = path_1.default.join(backupDirectory, backupFileName);
    const pgDumpPath = getPgDumpPath();
    await execFileAsync(pgDumpPath, [
        '--host',
        dbHost,
        '--port',
        dbPort,
        '--username',
        dbUser,
        '--format',
        'custom',
        '--blobs',
        '--file',
        backupFilePath,
        dbName
    ], {
        env: {
            ...process.env,
            PGPASSWORD: dbPassword
        }
    });
    await removeOldBackups();
    console.log(`Backup creado correctamente: ${backupFileName}`);
    return backupFilePath;
};
exports.createDatabaseBackup = createDatabaseBackup;
const getMillisecondsUntilNextBackup = () => {
    const now = new Date();
    const nextBackup = new Date();
    nextBackup.setHours(20, 0, 0, 0);
    if (nextBackup <= now) {
        nextBackup.setDate(nextBackup.getDate() + 1);
    }
    return nextBackup.getTime() - now.getTime();
};
const scheduleNextBackup = () => {
    const delay = getMillisecondsUntilNextBackup();
    setTimeout(async () => {
        try {
            await (0, exports.createDatabaseBackup)();
        }
        catch (error) {
            console.log('Error al crear el backup automático', error);
        }
        scheduleNextBackup();
    }, delay);
};
const startAutomaticBackups = async () => {
    try {
        const alreadyExistsToday = await backupAlreadyExistsToday();
        if (!alreadyExistsToday) {
            await (0, exports.createDatabaseBackup)();
        }
        scheduleNextBackup();
        console.log('Backups automáticos activados');
    }
    catch (error) {
        console.log('No se pudieron activar los backups automáticos', error);
    }
};
exports.startAutomaticBackups = startAutomaticBackups;
