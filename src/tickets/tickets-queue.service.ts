import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue, Job } from "bullmq";
import { CreateTicketDto } from "./dto/create-ticket.dto";

@Injectable()
export class TicketsQueueService {

    constructor(
        @InjectQueue('tickets-jobs')
        private readonly ticketsQueue: Queue,
    ) {}

    async enqueueCreateTicket(createTicketDto: CreateTicketDto) {
        const job: Job = await this.ticketsQueue.add('create-ticket', createTicketDto, {
            removeOnComplete: true, 
            removeOnFail: false, 
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        });

        return {
            jobId: job.id,
            status: 'queued',
        };
    }

    async getJobStatus(jobId: string) {
        const job = await this.ticketsQueue.getJob(jobId);
        if (!job) {
            return { status: 'not found' };
        }

        const state = await job.getState();
        const result = await job.returnvalue;

        return {
            jobId: job.id,
            state,
            result,
            failedReason: job.failedReason,
        };
    }

}