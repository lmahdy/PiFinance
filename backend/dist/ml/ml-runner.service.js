"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlRunnerService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const path = require("path");
let MlRunnerService = class MlRunnerService {
    async run(module, companyId) {
        const python = process.env.PYTHON_PATH || 'python';
        const scriptPath = path.resolve(__dirname, '..', '..', '..', 'ml', 'run_ml.py');
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(python, [scriptPath, '--module', module, '--company-id', companyId], {
                env: {
                    ...process.env,
                    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bi_platform',
                },
                stdio: 'inherit',
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`ML script failed with code ${code}`));
                }
            });
        });
    }
};
exports.MlRunnerService = MlRunnerService;
exports.MlRunnerService = MlRunnerService = __decorate([
    (0, common_1.Injectable)()
], MlRunnerService);
//# sourceMappingURL=ml-runner.service.js.map