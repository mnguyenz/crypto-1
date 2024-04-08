import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ASSETS } from '~core/constants/crypto-code.constant';
import { Exchanges } from '~core/enums/exchanges.enum';

export class BuyMinimumDto {
    @ApiProperty({
        example: ASSETS.CRYPTO.BTC
    })
    @IsNotEmpty()
    @IsString()
    asset: string;

    @ApiProperty({ enum: Exchanges, example: Exchanges.BINANCE })
    @IsNotEmpty()
    @IsEnum(Exchanges)
    exchange: Exchanges;
}
