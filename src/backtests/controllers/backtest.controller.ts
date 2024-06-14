import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BacktestService } from '~backtests/services/backtest.service';

@Controller('backtests')
@ApiTags('Backtests')
export class BacktestController {
    constructor(private backtestService: BacktestService) {}

    @Get('mxr1')
    backtestMxr1(): Promise<void> {
        return this.backtestService.backTestMxr1();
    }
}
