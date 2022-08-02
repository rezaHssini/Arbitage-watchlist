export type ExchangePrice = {
  [key: string]: string | number;
};

export type PricePlace = [string, string | number];

export interface IPrice {
  id: number;
  title: string;
  symbol: string;
  coingecko_id?: string;
  sort_order?: number;
  options: ExchangePrice;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
