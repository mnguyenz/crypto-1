import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BINANCE_SYMBOLS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';

export class BuyMinimumDto {
    @ApiProperty({
        example: BINANCE_SYMBOLS.BTCUSDT
    })
    @IsNotEmpty()
    @IsString()
    symbol: string;

    @ApiProperty({ enum: Exchanges, example: Exchanges.BINANCE })
    @IsNotEmpty()
    @IsEnum(Exchanges)
    exchange: Exchanges;
}
