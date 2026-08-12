export function createTranslateDirective(translator) {
  return ({ el, effect, ctx }) => {
    effect(() => {
      void ctx.scope._revision
      Promise.resolve().then(() => translator.translateNode(el))
    })
  }
}
