import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { CreateTicketDto } from "./dto/create-ticket.dto";

@Injectable()
export class TicketsQueueService {

    constructor(
        @InjectQueue('tickets-jobs')
        private readonly ticketsQueue: Queue,
    ) {}

    async enqueueCreateTicket(createTicketDto: CreateTicketDto) {
        return this.ticketsQueue.add(
            'create-ticket', 
            createTicketDto,
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        );
    }

    async getJobStatus(jobId: string) {
        const job = await this.ticketsQueue.getJob(jobId);
        if (!job) {
            return { status: 'not found' };
        }

        const state = await job.getState();

        return {
            id: job.id,
            name: job.name,
            state,
            returnValue: job.returnvalue,
            failedReason: job.failedReason,
        };
    }

}