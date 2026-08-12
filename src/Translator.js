export class Translator {
  constructor(translations) {
    this.translations = translations || {}
  }

  translateObject(objectToTranslate) {
    if (Array.isArray(objectToTranslate)) {
      return objectToTranslate.map(item => this.translateObject(item))
    }

    if (objectToTranslate && typeof objectToTranslate === 'object') {
      const result = {}
      for (const [key, value] of Object.entries(objectToTranslate)) {
        result[key] = this.translateObject(value)
      }
      return result
    }

    if (typeof objectToTranslate === 'string' && Object.hasOwn(this.translations, objectToTranslate)) {
      return this.translations[objectToTranslate]
    }

    return objectToTranslate
  }

  translateNode(domNode) {
    if (!domNode || !domNode.ownerDocument) return

    const textNodes = []
    if (domNode.nodeType === 3) {
      textNodes.push(domNode)
    } else {
      const walker = domNode.ownerDocument.createTreeWalker(domNode, 4)
      while (walker.nextNode()) textNodes.push(walker.currentNode)
    }

    for (const textNode of textNodes) {
      const original = textNode.nodeValue
      const match = original.match(/^(\s*)(.*?)(\s*)$/s)
      if (!match) continue

      const translated = this.translateObject(match[2])
      const result = match[1] + translated + match[3]
      if (result !== original) textNode.nodeValue = result
    }
  }
}
