import { Module } from '@nestjs/common';
import { ReportsController } from './reports/reports.controller';
import { HealthcheckController } from './healthcheck/healthcheck.controller';
import { ReportsService } from './reports/reports.service';
import { TicketsModule } from './tickets/tickets.module';
import { User } from '../db/models/User';
import { Company } from '../db/models/Company';
import { Ticket } from '../db/models/Ticket';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'task-dev',
      autoLoadModels: true,
      synchronize: true, 
    }),
    SequelizeModule.forFeature([Company, User, Ticket]),
    TicketsModule,
  ],
  controllers: [ReportsController, HealthcheckController],
  providers: [ReportsService],
})
export class AppModule {}
