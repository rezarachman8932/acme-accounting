import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { TicketsController } from "./tickets.controller";
import { TicketsProcessor } from "./tickets.processor";
import { TicketsQueueService } from "./tickets-queue.service";
import { TicketService } from "./ticket.service";

@Module({
    imports: [
        BullModule.registerQueue({ name: 'tickets-jobs' }),
    ],
    controllers: [TicketsController],
    providers: [
        TicketsQueueService,
        TicketsProcessor,
        TicketService,
    ],
})
export class TicketsModule {}