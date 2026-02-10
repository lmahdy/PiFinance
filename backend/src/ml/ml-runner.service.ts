import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class MlRunnerService {
  async run(module: 'sales' | 'inventory' | 'report' | 'all', companyId: string) {
    const python = process.env.PYTHON_PATH || 'python';
    const scriptPath = path.resolve(__dirname, '..', '..', '..', 'ml', 'run_ml.py');

    return new Promise<void>((resolve, reject) => {
      const child = spawn(python, [scriptPath, '--module', module, '--company-id', companyId], {
        env: {
          ...process.env,
          MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bi_platform',
        },
        stdio: 'inherit',
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ML script failed with code ${code}`));
        }
      });
    });
  }
}
