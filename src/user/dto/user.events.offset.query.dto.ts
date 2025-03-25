import {OffsetPaginationDto} from '../../common/dto/offset.pagination.dto';
import {IsQueryUserEventsName} from "../users.query.validator";

export class GetUserEventsOffsetQueryDto extends OffsetPaginationDto {
    @IsQueryUserEventsName(false)
    name: string;
}