"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = require("../controllers/expense.controller");
const router = (0, express_1.Router)();
router.get('/', expense_controller_1.getExpenses);
router.post('/', expense_controller_1.createExpense);
router.delete('/:id', expense_controller_1.deleteExpense);
exports.default = router;
