import { TicketCategory, TicketType } from "db/models/Ticket";
import { IsUUID, IsEnum, IsNotEmpty, IsString } from 'class-validator';

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