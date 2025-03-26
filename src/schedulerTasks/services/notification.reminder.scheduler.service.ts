import {Injectable} from '@nestjs/common';
import {Cron, Timeout} from '@nestjs/schedule';
import {EventsService} from '../../event/events.service';
import {EmailService} from '../../email/email.service';
import {EventType} from '../../event/entity/event.entity';
import {ResponseStatus} from '../../event-participation/entity/event-participation.entity';
import {CalendarType} from "../../calendar-member/entity/calendar-member.entity";
import {SchedulerConfig} from "../../config/scheduler.config";

@Injectable()
export class ReminderSchedulerService {
    constructor(
        private readonly eventsService: EventsService,
        private readonly emailService: EmailService,
    ) {
    }

    @Timeout(10000)
    @Cron(SchedulerConfig.prototype.checkReminders)
    async checkReminders() {
        try {
            const now = new Date(Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate(),
                new Date().getUTCHours(),
                new Date().getUTCMinutes(),
                new Date().getUTCSeconds()
            ));
            const endTime = new Date(now.getTime() + 59000); // now + 59 seconds

            // Get all reminders starting now
            const reminders = await this.eventsService.getEventsByStartTimeAndType(
                EventType.REMINDER,
                now,
                endTime,
            );

            console.log(`Found ${reminders.length} reminders to process`);

            for (const reminder of reminders) {
                // Get full event with participants
                const event = await this.eventsService.getEventByIdWithParticipations(
                    reminder.id,
                    false // isResponseStatusNull=false
                );

                // Track processed emails to avoid duplicates
                const processedEmails = new Set<string>();

                // Get ACCEPTED participants
                const acceptedParticipations = event.participations
                    .filter(p => p.responseStatus === ResponseStatus.ACCEPTED);

                // Process non-main calendars first
                for (const participation of acceptedParticipations) {
                    const user = participation.calendarMember.user;
                    const email = user.email;
                    const calendarType = participation.calendarMember.calendarType;

                    // Skip main calendars for now
                    if (calendarType === CalendarType.MAIN) continue;
                    if (processedEmails.has(email)) continue;

                    processedEmails.add(email);

                    const calendarName = participation.calendarMember.calendar.name;

                    await this.emailService.sendCalendarReminderEmail(
                        email,
                        event.name,
                        event.description || '',
                        calendarName
                    );
                }

                // Now process main calendars, skipping already processed emails
                for (const participation of acceptedParticipations) {
                    const user = participation.calendarMember.user;
                    const email = user.email;
                    const calendarType = participation.calendarMember.calendarType;

                    if (calendarType !== CalendarType.MAIN) continue;
                    if (processedEmails.has(email)) continue;

                    processedEmails.add(email);

                    const calendarName = participation.calendarMember.calendar.name;

                    await this.emailService.sendCalendarReminderEmail(
                        email,
                        event.name,
                        event.description || '',
                        calendarName
                    );
                }
            }
        } catch (error) {
            console.error(`Error in reminder scheduler: ${error.message}`);
        }
    }
}
