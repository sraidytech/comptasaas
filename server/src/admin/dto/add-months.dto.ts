import { IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMonthsDto {
  @ApiProperty({
    description: 'Months to add to the declaration type',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  months: number[];
}
