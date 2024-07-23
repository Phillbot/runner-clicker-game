// src/types/images.d.ts

type ImageContent = string;

declare module '*.svg' {
  const content: ImageContent;
  export default content;
}

declare module '*.png' {
  const content: ImageContent;
  export default content;
}

declare module '*.jpg' {
  const content: ImageContent;
  export default content;
}

declare module '*.jpeg' {
  const content: ImageContent;
  export default content;
}

declare module '*.gif' {
  const content: ImageContent;
  export default content;
}

declare module '*.webp' {
  const content: ImageContent;
  export default content;
}

declare module '*.bmp' {
  const content: ImageContent;
  export default content;
}
