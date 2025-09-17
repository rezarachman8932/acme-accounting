import { TicketCategory } from "../../db/models/Ticket";
import { TicketType } from "../../db/models/Ticket";

export const TicketTypeToCategoryMap: Record<TicketType, TicketCategory> = {
  [TicketType.managementReport]: TicketCategory.accounting,
  [TicketType.registrationAddressChange]: TicketCategory.corporate,
  [TicketType.strikeOff]: TicketCategory.management,
};

export function getTicketCategory(type: TicketType): TicketCategory {
  return TicketTypeToCategoryMap[type];
}