// src/calendar/dto/update-calendar.dto.ts
import {
    IsCalendarAndEventDescription,
    IsCalendarAndEventName
} from '../../common/validators/calendars.events.validator';

export class UpdateCalendarDto {
    @IsCalendarAndEventName(true)
    name?: string;

    @IsCalendarAndEventDescription(true, true)
    description?: string;
}
