import { TradeOpportiunity } from '../../../../pairs/dto/trade.dto';
import {
  IPrice,
  PricePlace,
} from '../../../../pairs/interfaces/price.interface';

export class TradeList {
  private list: TradeOpportiunity[] = [];
  add(
    buyPlace: PricePlace,
    sellPlace: PricePlace,
    differenceInPercent: number,
    pair: IPrice,
  ): void {
    this.list.push({
      originExchange: buyPlace[0],
      destinationExchange: sellPlace[0],
      buyPrice: +buyPlace[1],
      sellPrice: +sellPlace[1],
      profitInPercent: +differenceInPercent.toFixed(2),
      token: pair.symbol,
      title: pair.title,
    });
  }
  get(): TradeOpportiunity[] {
    return this.list;
  }
}
