import axios, { type AxiosRequestConfig } from 'axios';
import { inject, injectable } from 'inversify';

import { TelegramService } from '@app/entry/services/telegram.service';
import { EnvUtils, generateAuthTokenHeaders } from '@utils';

@injectable()
export class ApiClient {
  constructor(
    @inject(TelegramService)
    private readonly _telegramService: TelegramService,
  ) {}

  async post<T = unknown>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const url = this.resolveUrl(path);
    const response = await axios.post<T>(url, data, {
      ...config,
      headers: {
        ...generateAuthTokenHeaders(this._telegramService.initData),
        ...(config?.headers ?? {}),
      },
    });
    return response.data;
  }

  private resolveUrl(path: string): string {
    const isAbsolute = /^https?:\/\//.test(path);
    if (isAbsolute) {
      return path;
    }
    return EnvUtils.apiUrl(path);
  }
}
