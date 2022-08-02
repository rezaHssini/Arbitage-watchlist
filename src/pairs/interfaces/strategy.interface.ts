import { TradeOpportiunity } from '../dto/trade.dto';
import { IPrice } from './price.interface';

export interface IArbitageStrategy {
  findTrades: (pairs: IPrice[]) => Promise<TradeOpportiunity[]>;
}
