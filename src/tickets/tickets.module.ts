import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TicketsController } from "./tickets.controller";
import { TicketsProcessor } from "./tickets.processor";
import { TicketsQueueService } from "./tickets-queue.service";
import { TicketService } from "./ticket.service";
import { Ticket } from "db/models/Ticket";
import { User } from "db/models/User";
import { Company } from "db/models/Company";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
    imports: [
        SequelizeModule.forFeature([Ticket, User, Company]),
        BullModule.registerQueue({name: 'tickets-jobs',}),
    ],
    controllers: [TicketsController],
    providers: [
        TicketsQueueService,
        TicketsProcessor,
        TicketService,
    ],
    exports: [TicketService, TicketsQueueService],
})
export class TicketsModule {}