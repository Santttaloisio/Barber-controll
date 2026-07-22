"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bootstrap_controller_1 = require("../controllers/bootstrap.controller");
const router = (0, express_1.Router)();
router.get('/', bootstrap_controller_1.getBootstrap);
exports.default = router;
