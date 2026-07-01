"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cut_controller_1 = require("../controllers/cut.controller");
const router = (0, express_1.Router)();
router.get('/', cut_controller_1.getCuts);
router.post('/', cut_controller_1.createCut);
exports.default = router;
