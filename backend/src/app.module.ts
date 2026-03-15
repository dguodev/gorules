import { Module } from '@nestjs/common';
import { DecisionsModule } from './decisions/decisions.module';

@Module({
  imports: [DecisionsModule],
})
export class AppModule {}
