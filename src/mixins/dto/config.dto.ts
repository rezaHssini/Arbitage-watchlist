import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ConfigDto {
  /***********
   * General *
   ***********/
  @IsOptional()
  @IsBoolean()
  LOG_SILENT!: boolean;

  /********************
   * TELEGRAM  *
   ********************/
  @IsString()
  @IsNotEmpty()
  TELEGRAM_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_CHANNEL!: string;

  @IsNumber()
  @IsOptional()
  SEND_TELEGRAM_MESSAGE_DELAY_SEC!: number;

  @IsNumber()
  @IsOptional()
  SEND_TELEGRAM_MESSAGE_BATCH_SIZE!: number;

  /********************
   * STRATEGY *
   ********************/
  @IsOptional()
  @IsNumber()
  MINIMUM_DIFFERENCE_AS_PROFIT_PERCENT!: number;

  @IsNotEmpty()
  @IsNumber()
  CHECK_MARKET_INTERVAL!: number;

  /********************
   * PRICE SERVICE *
   ********************/

  @IsString()
  @IsNotEmpty()
  PRICE_SERVICE_URL!: string;

  /* Allow any other ENV */
  [key: string]: any | undefined;
}
