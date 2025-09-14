import { TicketType } from "db/models/Ticket";
import { IsUUID, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketDto {
    @IsUUID()
    @IsNotEmpty()
    companyId: number;

    @IsEnum(TicketType)
    @IsNotEmpty()
    type: TicketType; 
}