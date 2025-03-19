import {
    Controller,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Get,
    BadRequestException
} from '@nestjs/common';
import { UsersCalendarsService } from './users-calendars.service';
import { AddUserToCalendarDto } from './dto/add-user-to-calendar.dto';
import { UpdateUserInCalendarDto } from './dto/update-user-in-calendar.dto';
import { UserCalendar } from './entity/user-calendar.entity';
import { RequestWithUser } from "../common/types/request.types";
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { CalendarOwnerGuard, OnlyCreator } from "../calendar/guards/own.calendar.guard";
import { OwnUserCalendarGuard } from "./guards/own.user-calendar.guard";
import { UpdateUserCalendarGuard } from "./guards/update.user-calendar.guard";
import { CalendarParticipantGuard } from './guards/calendar.participant.guard';
import { JwtConfirmCalendarGuard } from 'src/calendar/guards/jwt-confirm-calendar.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('calendars/:calendarId/users')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UsersCalendarsController extends BaseCrudController<
    UserCalendar,
    AddUserToCalendarDto,
    UpdateUserInCalendarDto
> {
    constructor(private readonly usersCalendarsService: UsersCalendarsService) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<UserCalendar> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.getUserCalendar(id, calendarId);
    }

    protected async createEntity(dto: AddUserToCalendarDto, req: RequestWithUser): Promise<UserCalendar> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.addUserToCalendar(calendarId, req.user.userId, dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserInCalendarDto,
        req: RequestWithUser
    ): Promise<UserCalendar> {
        const hasRole = dto.role !== undefined;
        const hasColor = dto.color !== undefined;

        if (hasRole && hasColor) {
            throw new BadRequestException('You can update either role or color, but not both at the same time');
        }

        if (!hasRole && !hasColor) {
            throw new BadRequestException('Either role or color must be provided');
        }
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.updateUserInCalendar(
            calendarId,
            id,
            dto
        );
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        const calendarId = parseInt(req.params.calendarId, 10);
        return await this.usersCalendarsService.removeUserFromCalendar(
            calendarId,
            id
        );
    }

    @UseGuards(CalendarParticipantGuard)
    @Get()
    async getCalendarUsers(@Param('calendarId') calendarId: number, @Req() req: RequestWithUser): Promise<UserCalendar[]> {
        return await this.usersCalendarsService.getCalendarUsers(calendarId, req.user.userId);
    }

    @UseGuards(CalendarParticipantGuard)
    @Get(':id')
    async getById(@Param('id') id: number, @Req() req: RequestWithUser): Promise<UserCalendar> {
        return super.getById(id, req);
    } 

    @UseGuards(CalendarOwnerGuard)
    @OnlyCreator(true)
    @Post()
    async create(@Body() dto: AddUserToCalendarDto, @Req() req: RequestWithUser): Promise<UserCalendar> {
        return super.create(dto, req);
    }

    @UseGuards(UpdateUserCalendarGuard)
    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateUserInCalendarDto,
        @Req() req: RequestWithUser
    ): Promise<UserCalendar> {
        return super.update(id, dto, req);
    }

    @UseGuards(CalendarOwnerGuard)
    @OnlyCreator(true)
    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    @Public()
    @UseGuards(JwtConfirmCalendarGuard)
    @Post('/confirm-calendar/:confirm_token')
    async confirmCalendarWithConfirmToken(@Req() req: RequestWithUser) {
        return this.usersCalendarsService.confirmCalendar(req.user.userId, Number(req.user.calendarId));
    }
}