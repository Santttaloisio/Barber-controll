"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppData = exports.invalidateAppDataCache = void 0;
const supabase_1 = require("../db/supabase");
/* =========================
   CACHE
========================= */
const CACHE_TTL_MS = 3000;
let cache = null;
const invalidateAppDataCache = () => {
    cache = null;
};
exports.invalidateAppDataCache = invalidateAppDataCache;
/* =========================
   HELPERS
========================= */
const toNumber = (value) => Number(value ?? 0);
const getDate = (item) => new Date(item.fecha ?? item.date ?? item.created_at ?? Date.now());
const sameDay = (date, reference) => date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate();
const sameMonth = (date, reference) => date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth();
/* =========================
   NORMALIZERS
========================= */
const normalizeBarber = (barber) => ({
    id: Number(barber.id),
    nombre: barber.nombre ?? barber.name ?? 'Sin nombre',
    activo: barber.activo ?? barber.active ?? true
});
const normalizeService = (service) => ({
    id: Number(service.id),
    nombre: service.nombre ?? service.name ?? 'Sin nombre',
    precioBase: toNumber(service.precioBase ?? service.price ?? service.precio_base)
});
const normalizeExpense = (expense) => ({
    id: Number(expense.id),
    categoria: expense.categoria ?? expense.category ?? 'Gastos',
    descripcion: expense.descripcion ?? expense.description ?? '',
    monto: toNumber(expense.monto ?? expense.amount),
    metodoPago: expense.metodoPago ??
        expense.paymentMethod ??
        expense.payment_method ??
        'Sin metodo',
    fecha: expense.fecha ?? expense.date ?? expense.created_at
});
const normalizeCut = (cut, barbersById, servicesById) => {
    const barberId = Number(cut.barberId);
    const serviceId = Number(cut.serviceId);
    return {
        id: Number(cut.id),
        barberId,
        serviceId,
        monto: toNumber(cut.monto ?? cut.amount ?? cut.price),
        metodoPago: 'Sin metodo',
        fecha: cut.fecha ?? cut.date ?? cut.created_at,
        Barber: barbersById.get(barberId),
        Service: servicesById.get(serviceId)
    };
};
/* =========================
   SUMS
========================= */
const sumCuts = (cuts) => cuts.reduce((t, c) => t + toNumber(c.monto), 0);
const sumExpenses = (expenses) => expenses.reduce((t, e) => t + toNumber(e.monto), 0);
/* =========================
   DASHBOARD
========================= */
const buildDashboard = (cuts, expenses, barbers) => {
    const now = new Date();
    const todayCuts = cuts.filter((c) => sameDay(getDate(c), now));
    const monthCuts = cuts.filter((c) => sameMonth(getDate(c), now));
    const monthExpenses = expenses.filter((e) => sameMonth(getDate(e), now));
    const barbersById = new Map(barbers.map((b) => [b.id, b]));
    const servicesById = new Map();
    const barberStats = new Map();
    monthCuts.forEach((cut) => {
        const current = barberStats.get(cut.barberId) ?? {
            barberId: cut.barberId,
            nombre: barbersById.get(cut.barberId)?.nombre ?? 'Sin nombre',
            cortes: 0,
            facturacion: 0
        };
        current.cortes++;
        current.facturacion += toNumber(cut.monto);
        barberStats.set(cut.barberId, current);
    });
    return {
        hoy: {
            cortes: todayCuts.length,
            facturacion: sumCuts(todayCuts)
        },
        mes: {
            cortes: monthCuts.length,
            facturacion: sumCuts(monthCuts),
            gastos: sumExpenses(monthExpenses),
            gananciaEstimada: sumCuts(monthCuts) - sumExpenses(monthExpenses)
        },
        facturacionPorBarbero: Array.from(barberStats.values())
    };
};
/* =========================
   MAIN GET
========================= */
const getAppData = async () => {
    if (cache && cache.expiresAt > Date.now())
        return cache.data;
    const [barbersRes, servicesRes, cutsRes, expensesRes] = await Promise.all([
        supabase_1.supabase.from('barbers').select('*'),
        supabase_1.supabase.from('services').select('*'),
        supabase_1.supabase.from('cuts').select('*'),
        supabase_1.supabase.from('expenses').select('*')
    ]);
    const barbers = (barbersRes.data ?? []).map(normalizeBarber);
    const services = (servicesRes.data ?? []).map(normalizeService);
    const expenses = (expensesRes.data ?? []).map(normalizeExpense);
    const barbersById = new Map(barbers.map((barber) => [barber.id, barber]));
    const servicesById = new Map(services.map((service) => [service.id, service]));
    const cuts = (cutsRes.data ?? []).map((cut) => normalizeCut(cut, barbersById, servicesById));
    const data = {
        dashboard: buildDashboard(cuts, expenses, barbers),
        month: {},
        year: {},
        cuts,
        barbers,
        services,
        expenses
    };
    cache = {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data
    };
    return data;
};
exports.getAppData = getAppData;
