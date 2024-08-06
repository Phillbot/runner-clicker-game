import FontFaceObserver from 'fontfaceobserver';

export async function preloadResourcesWithProgress(
  imageUrls: string[],
  fontNames: string[],
  updateProgress: (progress: number) => void,
): Promise<{ [key: string]: HTMLImageElement }> {
  const totalResources = imageUrls.length + fontNames.length;
  let loadedResources = 0;
  const loadedImages: { [key: string]: HTMLImageElement } = {};

  const updateResourceProgress = () => {
    loadedResources++;
    updateProgress((loadedResources / totalResources) * 100);
  };

  // Load images
  const imagePromises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedImages[url] = img;
        updateResourceProgress();
        resolve();
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        updateResourceProgress(); // Increment progress even if the image fails to load
        reject(new Error(`Failed to load image: ${url}`));
      };
    });
  });

  // Load fonts
  const fontPromises = fontNames.map(name => {
    const font = new FontFaceObserver(name);
    return font
      .load()
      .then(() => {
        updateResourceProgress();
      })
      .catch(error => {
        console.error('Font loading failed:', error);
        updateResourceProgress(); // Increment progress even if the font fails to load
      });
  });

  await Promise.allSettled([...imagePromises, ...fontPromises]);
  return loadedImages;
}
