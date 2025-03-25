// src/event-participation/event-participations.controller.ts
import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {BaseCrudController} from '../common/controller/base-crud.controller';
import {EventParticipation} from './entity/event-participation.entity';
import {CreateEventParticipationDto} from './dto/create-event-participation.dto';
import {UpdateEventParticipationDto} from './dto/update-event-participation.dto';
import {EventParticipationsService} from './event-participations.service';
import {RequestWithUser} from '../common/types/request.types';
import {Public} from '../common/decorators/public.decorator';
import {EventGuard} from "../event/guards/event.guard";
import { confirmParticipationGuard } from './guards/confirm-participation.guard';

@Controller('events/:eventId/calendar-members')
export class EventParticipationsController extends BaseCrudController<
    EventParticipation,
    CreateEventParticipationDto,
    UpdateEventParticipationDto
> {
    constructor(
        private readonly eventParticipationsService: EventParticipationsService
    ) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<EventParticipation> {
        const eventId = parseInt(req.params.eventId, 10);
        return await this.eventParticipationsService.getEventParticipationByMemberAndEvent(
            id,
            eventId
        );
    }

    protected async createEntity(dto: CreateEventParticipationDto, req: RequestWithUser): Promise<EventParticipation> {
        const eventId = parseInt(req.params.eventId, 10);
        return await this.eventParticipationsService.inviteUserToEvent(
            eventId,
            dto.userId,
            dto.calendarId,
            req.user.userId,
        );
    }

    protected async updateEntity(
        id: number,
        dto: UpdateEventParticipationDto,
        req: RequestWithUser
    ): Promise<EventParticipation> {
        const eventId = parseInt(req.params.eventId, 10); //TODO: оно надо? НАДО
        return await this.eventParticipationsService.updateEventParticipation(
            id,
            eventId,
            dto
        );
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        const eventId = parseInt(req.params.eventId, 10);//TODO: оно надо? НАДО
        return await this.eventParticipationsService.deleteEventParticipation(
            id,
            eventId
        );
    }

    // GET /events/{eventId}/calendar-members/{id}
    @UseGuards(EventGuard)
    @Get(':calendarMemberId')
    async getById(@Param('calendarMemberId') id: number, @Req() req: RequestWithUser): Promise<EventParticipation> {
        return super.getById(id, req);
    }

    // POST /events/{eventId}/calendar-members
    @UseGuards(EventGuard)
    @Post()
    async create(@Body() dto: CreateEventParticipationDto, @Req() req: RequestWithUser): Promise<EventParticipation> {
        console.log("get access for create new participation")
        return super.create(dto, req);
    }

    // PATCH /events/{eventId}/calendar-members/{id}
    @Patch(':calendarMemberId')
    async update(
        @Param('calendarMemberId') id: number,
        @Body() dto: UpdateEventParticipationDto,
        @Req() req: RequestWithUser
    ): Promise<EventParticipation> {
        return super.update(id, dto, req);
    }

    // DELETE /events/{eventId}/calendar-members/{id}
    @Delete(':calendarMemberId')
    async delete(@Param('calendarMemberId') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    // POST /events/{eventId}/calendar-members/{id}/confirm-participation/{confirm-token}
    @Public()
    @UseGuards(EventGuard)
    @UseGuards(confirmParticipationGuard)
    // @UseGuards(JwtConfirmEventParticipationGuard)
    @Post(':calendarMemberId/confirm-participation/:confirm_token')
    async confirmEventParticipation(@Req() req: RequestWithUser): Promise<EventParticipation> {
        return await this.eventParticipationsService.confirmEventParticipation(
            Number(req.user.eventParticipationId)
        );
    }
}