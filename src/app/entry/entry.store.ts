import { inject, injectable } from 'inversify';
import { action, computed, makeObservable, observable } from 'mobx';

import { StartupCoordinator } from './startup-coordinator';
import type { UserStatus } from './types';

@injectable()
export class EntryStore {
  @observable
  private _isLoading: boolean = true;
  @observable
  private _isAuthorized: boolean = false;
  @observable
  private _resourcesLoaded: boolean = false;
  @observable
  private _loadProgress: number = 0;
  @observable
  private _userStatus: UserStatus = 1;

  constructor(
    @inject(StartupCoordinator)
    private readonly _startupCoordinator: StartupCoordinator,
  ) {
    makeObservable(this);
  }

  @action
  async initialize() {
    await this._startupCoordinator.run(this.setters);
  }

  @computed
  get isUnsupportedScreen(): boolean {
    return this._startupCoordinator.isUnsupportedScreen;
  }

  @action
  setLoading(value: boolean) {
    this._isLoading = value;
  }

  @action
  setAuthorized(value: boolean) {
    this._isAuthorized = value;
  }

  @action
  private setResourcesLoaded(value: boolean) {
    this._resourcesLoaded = value;
  }

  @action
  private setLoadProgress(value: number) {
    this._loadProgress = value;
  }

  @action
  private setUserStatus(value: UserStatus) {
    this._userStatus = value;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isAuthorized(): boolean {
    return this._isAuthorized;
  }

  get resourcesLoaded(): boolean {
    return this._resourcesLoaded;
  }

  get loadProgress(): number {
    return this._loadProgress;
  }

  get userStatus(): UserStatus {
    return this._userStatus;
  }

  get setters() {
    return {
      setLoading: (value: boolean) => this.setLoading(value),
      setAuthorized: (value: boolean) => this.setAuthorized(value),
      setResourcesLoaded: (value: boolean) => this.setResourcesLoaded(value),
      setLoadProgress: (value: number) => this.setLoadProgress(value),
      setUserStatus: (value: UserStatus) => this.setUserStatus(value),
    };
  }

  disableClosingConfirmation(): void {
    this._startupCoordinator.disableClosingConfirmation();
  }
}
