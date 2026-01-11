import { IsDateString } from 'class-validator';

export class CreatePeriodDto {
  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;
}
