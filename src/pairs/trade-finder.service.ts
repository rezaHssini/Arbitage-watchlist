import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { TradeOpportiunity } from './dto/trade.dto';
import { GetPairsService } from './get-pairs.service';
import { IPrice } from './interfaces/price.interface';
import { Telegram } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { ConfigParamNames } from './enum/param-names.enum';
import { IArbitageStrategy } from './interfaces/strategy.interface';
import { TRADE_STRATEGY } from './constants';
import { CatchErrors } from '../mixins/decorators/catch-error';

@Injectable()
export class TradeFinderService implements OnModuleInit {
  protected telegram: Telegram;
  protected chatId: string;
  sendMessageDelay: number;
  messageBatchSize: number;

  constructor(
    private readonly pairPriceService: GetPairsService,
    private readonly config: ConfigService,
    @Inject(TRADE_STRATEGY) private readonly tradeStrategy: IArbitageStrategy,
  ) {
    this.setDefaults();
  }

  @CatchErrors()
  async onModuleInit(): Promise<void> {
    const checkPricesDurationInSec = +this.getConfig(
      ConfigParamNames.CheckPricesInterval,
      '900',
    );
    setInterval(async () => {
      console.log('Send get pairs request');
      const pairs = await this.callPriceServer();
      console.log(`${pairs.length} Pairs fetched, Start finding trades`);
      const opportiunities = await this.findTrades(pairs);
      console.log(
        `Trade finding is compeleted. ${opportiunities.length} trades found `,
      );
      await this.handleTrades(opportiunities);
      console.log('trades sent to telegram and process finished');
      console.log('-----------------------------------------------');
    }, checkPricesDurationInSec * 1000);
  }
  @CatchErrors()
  private async callPriceServer(): Promise<IPrice[]> {
    return this.pairPriceService.sendRequest();
  }
  @CatchErrors()
  private async findTrades(pairs: IPrice[]): Promise<TradeOpportiunity[]> {
    return this.tradeStrategy.findTrades(pairs);
  }
  @CatchErrors()
  private async handleTrades(trades: TradeOpportiunity[]): Promise<void> {
    const messages = [];
    for (let i = 0; i < trades.length; i += this.messageBatchSize) {
      const chunk = trades.slice(i, i + this.messageBatchSize);
      const text = this.getString(chunk);
      messages.push(text);
    }
    this.delaiedLoop(messages, 0);
  }
  private getString(trades: TradeOpportiunity[]): string {
    let str = '';
    trades.forEach((el) => {
      str += `Title: ${el.title} \n Symbol: ${el.token} \n From: ${el.originExchange} \n To: ${el.destinationExchange} \n Buy: ${el.buyPrice} \n Sell: ${el.sellPrice} \n Profit: ${el.profitInPercent}% \n ------------------------------ \n`;
    });
    return str;
  }
  private delaiedLoop(messages: string[], counter: number): void {
    setTimeout(() => {
      this.telegram.sendMessage(`@${this.chatId}`, messages[counter]);
      counter++;
      if (messages[counter]) {
        this.delaiedLoop(messages, counter);
      }
    }, this.sendMessageDelay);
  }
  @CatchErrors()
  private setDefaults(): void {
    const token = this.getConfig(ConfigParamNames.TelegramToken);
    this.chatId = this.getConfig(ConfigParamNames.TelegramChannel);
    this.sendMessageDelay = +this.getConfig(
      ConfigParamNames.SendMessageDelay,
      '3',
    );
    this.messageBatchSize = +this.getConfig(
      ConfigParamNames.SendMessageBatchSize,
      '20',
    );
    this.telegram = new Telegram(token);
  }
  private getConfig(name: ConfigParamNames, defaultValue?: string): string {
    const param = this.config.get(name);

    if (!param?.length) {
      if (!defaultValue) {
        throw new Error(`Invalid config param : ${name}`);
      }
      return defaultValue;
    }
    return param;
  }
}
