import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TradeOpportiunity } from '../../dto/trade.dto';
import { ConfigParamNames } from '../../enum/param-names.enum';
import {
  ExchangePrice,
  IPrice,
  PricePlace,
} from '../../interfaces/price.interface';
import { IArbitageStrategy } from '../../interfaces/strategy.interface';
import { TradeList } from './utils/trade-list';
import { dexList } from './utils/dex-list';

const nomalizedDexList = dexList.map((e) => e.toLowerCase());
const checkExchanges = false;

@Injectable()
export class SimpleStrategy implements IArbitageStrategy {
  constructor(private readonly config: ConfigService) {}

  async findTrades(pairs: IPrice[]): Promise<TradeOpportiunity[]> {
    const trades: TradeList = new TradeList();
    pairs.forEach((pair) => {
      if (pair.options) {
        let exchangePrices = this.parsePriceOptions(pair.options);
        const [buyPlace, sellPlace] = this.getMinAndMaxPrices(exchangePrices);

        if (+buyPlace[1] != 0 && +sellPlace[1] != 0) {
          const differenceInPercent = this.findDifferenceInPercent(
            +buyPlace[1],
            +sellPlace[1],
          );
          const profitInPercentage = this.getMinimumDifference();
          if (differenceInPercent >= profitInPercentage) {
            trades.add(buyPlace, sellPlace, differenceInPercent, pair);
          }
        }
      }
    });

    return this.filterByDex(trades.get());
  }
  private parsePriceOptions(prices: ExchangePrice): PricePlace[] {
    let exchangePrices = Object.entries(prices);
    return exchangePrices.sort((a, b) => +a[1] - +b[1]);
  }
  private getMinAndMaxPrices(exchangePrices: PricePlace[]): PricePlace[] {
    const buyPlace = exchangePrices[0];
    const sellPlace = exchangePrices[exchangePrices.length - 1];
    return [buyPlace, sellPlace];
  }
  private findDifferenceInPercent(a: number, b: number): number {
    const difference = Math.abs(a - b);
    const average = (a + b) / 2;
    const result = difference / average;

    return 100 * result;
  }
  private getMinimumDifference(): number {
    return +this.config.get(ConfigParamNames.MinimumPriceDifference);
  }
  private filterByDex(trades: TradeOpportiunity[]): TradeOpportiunity[] {
    if (!checkExchanges) {
      return;
    }
    return trades.filter(
      (e) =>
        nomalizedDexList.indexOf(e.originExchange.toLowerCase()) != -1 &&
        nomalizedDexList.indexOf(e.destinationExchange.toLowerCase()) != -1,
    );
  }
}
