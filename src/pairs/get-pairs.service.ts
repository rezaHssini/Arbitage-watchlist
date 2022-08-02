import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ConfigParamNames } from './enum/param-names.enum';
import { IPrice } from './interfaces/price.interface';

@Injectable()
export class GetPairsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async sendRequest(): Promise<IPrice[]> {
    const url = this.getUrl();

    let response;
    const response$ = this.httpService.get(url);
    try {
      response = await firstValueFrom(response$);
    } catch (e) {
      const dataStr = JSON.stringify(e.response?.data || {});
      const msg = `${e.message}: (${dataStr})`;
      throw new Error(msg);
    }
    if (response.status > 400) {
      throw new Error(
        `Failed to get pair prices: ${response.status} ${response.statusText}`,
      );
    }

    return response.data.symbols as IPrice[];
  }
  private getUrl(): string {
    const url = this.config.get<string>(ConfigParamNames.PairPriceServiceUrl);
    if (!url?.length) {
      throw new Error(`Invalid URL : ${ConfigParamNames.PairPriceServiceUrl}`);
    }
    return url;
  }
}
