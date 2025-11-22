import { AxiosProgressEvent } from 'axios';
import { inject, injectable } from 'inversify';

import { ApiClient } from '@app/common/api-client';
import { EnvUtils } from '@utils';

export type GetMeResponse = Readonly<{
  ok: boolean;
  user: User;
  bot: Bot;
}>;

export type CreateUserResponse = Readonly<{
  ok: boolean;
  user: User;
  bot: Bot;
}>;

import type { Bot, User } from '../types';

type ProgressHandler = (progress: number) => void;

@injectable()
export class EntryApi {
  constructor(@inject(ApiClient) private readonly _api: ApiClient) {}

  async fetchUser(
    initData: string,
    onProgress?: ProgressHandler,
  ): Promise<GetMeResponse> {
    const response = await this._api.post<GetMeResponse>(
      EnvUtils.apiEndpoints.getMe,
      { initData },
      {
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (!onProgress) {
            return;
          }
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          onProgress(progress);
        },
      },
    );

    if (!response.ok) {
      throw new Error('Unauthorized');
    }

    return response;
  }

  async createUser(
    initData: string,
    referralId?: string | number,
  ): Promise<CreateUserResponse> {
    const response = await this._api.post<CreateUserResponse>(
      EnvUtils.apiEndpoints.createUser,
      { initData, referralId },
    );

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return response;
  }

  async updateLastLogin(initData: string): Promise<void> {
    try {
      await this._api.post(EnvUtils.apiEndpoints.updateLastLogin, {
        initData,
        lastLogin: Date.now(),
      });
    } catch (error) {
      console.error('Failed to update last login', error);
    }
  }
}
