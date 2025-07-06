"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = __importDefault(require("./common/logger"));
class App {
    constructor() {
        dotenv_1.default.config();
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
    }
    init() {
        logger_1.default.start('init', this.constructor.name);
        if (!process.env.PORT) {
            logger_1.default.info(`No port value specified...`);
        }
        const PORT = parseInt(process.env.PORT, 10);
        this.app.get('/', (req, res) => {
            res.json('Hello World!');
        });
        this.app.listen(PORT, () => {
            logger_1.default.info(`Server is running on http://localhost:${PORT}`);
        });
    }
}
const server = new App();
server.init();
