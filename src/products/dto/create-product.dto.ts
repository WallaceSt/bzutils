import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @IsEnum(['kilo', 'saco', 'caixa', 'pacote', 'cartela', 'unidade', 'dúzia'])
  package: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  category: number;
}
