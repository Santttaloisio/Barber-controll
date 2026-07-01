"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = exports.Cut = exports.Service = exports.Barber = void 0;
const barber_model_1 = require("./barber.model");
Object.defineProperty(exports, "Barber", { enumerable: true, get: function () { return barber_model_1.Barber; } });
const service_model_1 = require("./service.model");
Object.defineProperty(exports, "Service", { enumerable: true, get: function () { return service_model_1.Service; } });
const cut_model_1 = require("./cut.model");
Object.defineProperty(exports, "Cut", { enumerable: true, get: function () { return cut_model_1.Cut; } });
const expense_model_1 = require("./expense.model");
Object.defineProperty(exports, "Expense", { enumerable: true, get: function () { return expense_model_1.Expense; } });
barber_model_1.Barber.hasMany(cut_model_1.Cut, {
    foreignKey: 'barberId'
});
cut_model_1.Cut.belongsTo(barber_model_1.Barber, {
    foreignKey: 'barberId'
});
service_model_1.Service.hasMany(cut_model_1.Cut, {
    foreignKey: 'serviceId'
});
cut_model_1.Cut.belongsTo(service_model_1.Service, {
    foreignKey: 'serviceId'
});
