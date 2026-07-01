"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const barber_controller_1 = require("../controllers/barber.controller");
const router = (0, express_1.Router)();
router.get('/', barber_controller_1.getBarbers);
router.post('/', barber_controller_1.createBarber);
router.delete('/:id', barber_controller_1.deleteBarber);
exports.default = router;
