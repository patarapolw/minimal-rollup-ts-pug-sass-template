declare module '*.pug' {
  function templateFn(ctx?: any): string
  export default templateFn
}

declare module '*.static.pug' {
  const template: string
  export default template
}
