import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Company } from '../../db/models/Company';
import { Ticket } from '../../db/models/Ticket';
import { User } from '../../db/models/User';
import { TicketsQueueService } from './tickets-queue.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('api/v1/tickets')
export class TicketsController {

  constructor(private readonly ticketsQueueService: TicketsQueueService) {}

  @Get()
  async findAll() {
    return await Ticket.findAll({ include: [Company, User] });
  }

  @Post()
  async create(@Body() ticketDto: CreateTicketDto) {
    return await this.ticketsQueueService.enqueueCreateTicket(ticketDto);
  }

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    return await this.ticketsQueueService.getJobStatus(jobId);
  }

}