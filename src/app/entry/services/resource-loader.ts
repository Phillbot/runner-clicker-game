import { injectable } from 'inversify';

import { preloadResourcesWithProgress } from '@utils';

type ProgressHandler = (progress: number) => void;

@injectable()
export class ResourceLoader {
  async load(
    imageUrls: string[],
    fontNames: string[],
    onProgress: ProgressHandler,
  ): Promise<void> {
    const totalResources = imageUrls.length + fontNames.length;

    if (totalResources === 0) {
      onProgress(100);
      await this._markFontsReady();
      return;
    }

    const safeUpdateProgress = (progress: number) => {
      const next = Math.min(100, Math.max(0, progress));
      onProgress(next);
    };

    try {
      const preloadPromise = preloadResourcesWithProgress(
        imageUrls,
        fontNames,
        safeUpdateProgress,
      );

      // Do not block UI forever on slow networks: give up after 4s and continue.
      const timeoutFallback = new Promise<void>(resolve =>
        setTimeout(resolve, 4000),
      );

      await Promise.race([preloadPromise, timeoutFallback]);
      safeUpdateProgress(100);
      await this._markFontsReady();
    } catch (error) {
      console.error('Resource preloading failed', error);
      safeUpdateProgress(100);
    }
  }

  private async _markFontsReady(): Promise<void> {
    try {
      await document.fonts.ready;
      document.body.classList.add('fonts-loaded');
    } catch {
      // Ignore font readiness errors.
    }
  }
}
