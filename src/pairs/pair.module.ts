import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TRADE_STRATEGY } from './constants';
import { GetPairsService } from './get-pairs.service';
import { SimpleStrategy } from './strategies/simple-strategy/simple-strategy.strategy';
import { TradeFinderService } from './trade-finder.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    GetPairsService,
    TradeFinderService,
    {
      provide: TRADE_STRATEGY,
      useClass: SimpleStrategy,
    },
  ],
  exports: [],
})
export class PairsModule {}
