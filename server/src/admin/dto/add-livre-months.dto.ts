import { IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLivreMonthsDto {
  @ApiProperty({
    description: 'Array of months (1-12) to add to the livre type',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  months: number[];
}
