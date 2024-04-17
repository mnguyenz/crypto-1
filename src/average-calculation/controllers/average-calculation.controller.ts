import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AverageCalculationService } from '~average-calculation/services/average-calculation.service';
import { Exchanges } from '~core/enums/exchanges.enum';

@Controller('average-calculation')
@ApiTags('Average Calculation')
export class AverageCalculationController {
    constructor(private averageCalculationService: AverageCalculationService) {}

    @Get('/:symbol/:exchange')
    getAverage(@Param('symbol') symbol: string, @Param('exchange') exchange: Exchanges): Promise<number> {
        return this.averageCalculationService.getDCA(symbol, exchange);
    }
}
