export async function preloadResourcesWithProgress(
  resources: string[],
  updateProgress: (progress: number) => void,
): Promise<void> {
  let loadedResources = 0;

  await Promise.all(
    resources.map(resource => {
      return new Promise<void>((resolve, reject) => {
        if (
          resource.endsWith('.woff2') ||
          resource.endsWith('.woff') ||
          resource.endsWith('.ttf') ||
          resource.endsWith('.otf')
        ) {
          // Load font
          const font = new FontFace('CustomFont', `url(${resource})`);
          font
            .load()
            .then(() => {
              document.fonts.add(font);
              loadedResources++;
              updateProgress((loadedResources / resources.length) * 100);
              resolve();
            })
            .catch(reject);
        } else {
          // Load image
          const img = new Image();
          img.src = resource;
          img.onload = () => {
            loadedResources++;
            updateProgress((loadedResources / resources.length) * 100);
            resolve();
          };
          img.onerror = reject;
        }
      });
    }),
  );
}
