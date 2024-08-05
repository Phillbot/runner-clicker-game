declare module 'imgloader' {
  interface ImgLoaderOptions {
    src: string;
    onComplete: (percentage: number, success: boolean) => void;
  }

  const ImgLoader: {
    loadImages: (options: ImgLoaderOptions) => void;
  };

  export default ImgLoader;
}
