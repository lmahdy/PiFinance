import { Module } from '@nestjs/common';
import { MlRunnerService } from './ml-runner.service';

@Module({
  providers: [MlRunnerService],
  exports: [MlRunnerService],
})
export class MlModule {}
