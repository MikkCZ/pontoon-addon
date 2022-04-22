declare module '*.png' {
  const dataUri: string;
  export default dataUri;
}

declare module '*.svg' {
  const dataUri: string;
  export default dataUri;
}

declare module '*.md' {
  const content: string;
  export default content;
}
