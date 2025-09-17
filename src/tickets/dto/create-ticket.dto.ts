import { TicketCategory, TicketType } from '../../../db/models/Ticket';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
    @IsNotEmpty()
    companyId: number;

    @IsEnum(TicketType)
    @IsNotEmpty()
    type: TicketType;

    @IsNotEmpty()
    assigneeId: number;

    @IsEnum(TicketCategory)
    @IsNotEmpty()
    category?: TicketCategory;
}