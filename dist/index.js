"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const cors_1 = __importDefault(require("cors"));
exports.app = (0, express_1.default)();
const PORT = 3000;
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use('/api/v1', routes_1.mainRouter);
exports.app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send({
        msg: "Server is healthy!!"
    });
}));
exports.app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
