import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket, TicketCategory, TicketStatus, TicketType } from '../../db/models/Ticket';
import { User, UserRole } from '../../db/models/User';
import { Company } from '../../db/models/Company';
import { getTicketCategory } from '../utils/tickets.helper';

interface TicketDto {
  id: number;
  type: TicketType; 
  companyId: number;
  assigneeId: number;
  status: TicketStatus;
  category: TicketCategory;
}

@Injectable()
export class TicketService {

    constructor(
        @InjectModel(Ticket)
        private readonly ticketModel: typeof Ticket,

        @InjectModel(User)
        private readonly userModel: typeof User,

        @InjectModel(Company)
        private readonly companyModel: typeof Company,
    ) {}

    private async createTicket(
        companyId: number,
        assigneeId: number,
        category: TicketCategory,
        type: TicketType,
      ): Promise<TicketDto> {
        const ticket = await this.ticketModel.create({
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
        };
      }

    async createTicketFromDto(dto: CreateTicketDto): Promise<TicketDto> {
        const { companyId, type } = dto;
        var assigneeId = 0;

        if (type == TicketType.registrationAddressChange) {
            await this.checkIfRegistrationAddressChange(companyId, type);

            const secretaries = await this.findSecretaryRolesInCompany(companyId);

            if (secretaries.length > 0) {
                if (secretaries.length > 1) {
                    throw new ConflictException('Multiple users with role corporateSecretary. Cannot create a ticket.',);
                }

                assigneeId = secretaries[0].id;
            } else {
                const directors = await this.findDirectorRolesInCompany(companyId, type);
                assigneeId = directors[0].id;
            }
        }

        if (type == TicketType.strikeOff) { 
            const directors = await this.findDirectorRolesInCompany(companyId, type);
            assigneeId = directors[0].id;

            await this.resolveTicketStatus(companyId);
        }

        if (type == TicketType.managementReport) {
            const accountants = await this.findAccountantRolesInCompany(companyId);
            assigneeId = accountants[0].id;
        }

        return this.createTicket(companyId, assigneeId, getTicketCategory(type), type);
    }

    async checkIfRegistrationAddressChange(companyId: number, type: TicketType) {
        const existingTicket = await this.ticketModel.findOne({ where: { companyId, type } });

        if (existingTicket && type === TicketType.registrationAddressChange) {
            throw new ConflictException(`A ${type} ticket already exists for this company.`,);
        }
    }

    async resolveTicketStatus(companyId: number) {
        await this.ticketModel.update(
            { status: TicketStatus.resolved },
            { where: { companyId, status: { [Op.ne]: TicketStatus.resolved } } },
        );
    }

    async findDirectorRolesInCompany(companyId: number, type: string): Promise<User[]> {
        const directors = await this.userModel.findAll({
            where: { companyId, role: UserRole.director },
            order: [['createdAt', 'DESC']],
        });

        if (directors.length === 0) {
            throw new ConflictException('No Director or and Secretary found for this company.');
        }

        if (directors.length > 1) {
            throw new ConflictException(`Multiple Directors found. Cannot create a ${type} ticket.`);
        }

        return directors;
    }

    async findSecretaryRolesInCompany(companyId: number): Promise<User[]> {
        return this.userModel.findAll({
            where: { companyId, role: UserRole.corporateSecretary },
            order: [['createdAt', 'DESC']],
        });
    }

    async findAccountantRolesInCompany(companyId: number): Promise<User[]> {
        const accountants = await this.userModel.findAll({
            where: { companyId, role: UserRole.accountant },
            order: [['createdAt', 'DESC']],
        });

        if (!accountants.length) {
            throw new ConflictException(`Cannot find user with role accountant to create a ticket`,);
        }

        return accountants;
    }

}