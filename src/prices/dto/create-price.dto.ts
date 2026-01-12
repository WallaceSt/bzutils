import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreatePriceDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  currency: number;

  @IsInt()
  @IsPositive()
  product: number;

  @IsInt()
  @IsPositive()
  period: number;
}
