import { Body, ConflictException, Controller, Get, Post } from '@nestjs/common';
import { Company } from '../../db/models/Company';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  TicketType,
} from '../../db/models/Ticket';
import { User, UserRole } from '../../db/models/User';

interface newTicketDto {
  type: TicketType;
  companyId: number;
}

interface TicketDto {
  id: number;
  type: TicketType;
  companyId: number;
  assigneeId: number;
  status: TicketStatus;
  category: TicketCategory;
}

@Controller('api/v1/tickets')
export class TicketsController {
  @Get()
  async findAll() {
    return await Ticket.findAll({ include: [Company, User] });
  }

  @Post()
  async create(@Body() newTicketDto: newTicketDto) {
    const { type, companyId } = newTicketDto;

    if (type == TicketType.registrationAddressChange) {
      const existing = await Ticket.findOne({ where: { companyId, type } });
      if (existing) {
        throw new ConflictException('A registrationAddressChange ticket already exists for this company.',);
      }
    }

    const category =
      type === TicketType.managementReport
        ? TicketCategory.accounting
        : TicketCategory.corporate;

    let userRole: UserRole;

    if (type == TicketType.managementReport) {
      userRole = UserRole.accountant;
    } else if (type == TicketType.registrationAddressChange) {
      const secretaries = await User.findAll({
        where: { companyId, role: UserRole.corporateSecretary },
        order: [['createdAt', 'DESC']],
      });

      if (secretaries.length > 0) {
        if (secretaries.length > 1) {
          throw new ConflictException('Multiple users with role corporateSecretary. Cannot create a ticket.',);
        }

        return this.createTicket(companyId, secretaries[0].id, category, type);
      } else {
        const directors = await User.findAll({
          where: { companyId, role: UserRole.director },
          order: [['createdAt', 'DESC']],
        });

        if (directors.length === 0) {
          throw new ConflictException('No Corporate Secretary or Director found for this company.',);
        }

        if (directors.length > 1) {
          throw new ConflictException('Multiple Directors found. Cannot create a ticket.',);
        }

        return this.createTicket(companyId, directors[0].id, category, type);
      }
    } else {
      userRole = UserRole.corporateSecretary;
    }

    const assignees = await User.findAll({
      where: { companyId, role: userRole },
      order: [['createdAt', 'DESC']],
    });

    if (!assignees.length) {
      throw new ConflictException(`Cannot find user with role ${userRole} to create a ticket`,);
    }

    if (userRole === UserRole.corporateSecretary && assignees.length > 1) {
      throw new ConflictException(`Multiple users with role ${userRole}. Cannot create a ticket`,);
    }

    return this.createTicket(companyId, assignees[0].id, category, type);
  }

  private async createTicket(
    companyId: number,
    assigneeId: number,
    category: TicketCategory,
    type: TicketType,
  ): Promise<TicketDto> {
    const ticket = await Ticket.create({
      companyId,
      assigneeId,
      category,
      type,
      status: TicketStatus.open,
    });
    return {
      id: ticket.id,
      type: ticket.type,
      assigneeId: ticket.assigneeId,
      status: ticket.status,
      category: ticket.category,
      companyId: ticket.companyId,
    }
  }
}