import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketService } from './ticket.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@Processor('tickets-jobs')
export class TicketsProcessor extends WorkerHost {

    private readonly logger = new Logger(TicketsProcessor.name);

    constructor(private readonly ticketService: TicketService) {
        super();
    }

    async process(job: Job<CreateTicketDto, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);

        try {
            const dto = job.data as CreateTicketDto;
            const ticket = await this.ticketService.createTicketFromDto(dto);
            this.logger.log(`Job ${job.id} completed successfully (ticketId=${ticket.id})`);
            return ticket;
        } catch (error) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
            throw error;
        }
    }

}