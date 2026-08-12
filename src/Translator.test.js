// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { Translator } from './Translator.js'

const translations = {
  'Hello world': 'Привет мир',
  'Good morning': 'Доброе утро',
  name: 'имя',
  age: 'возраст',
}

function createTranslator() {
  return new Translator(translations)
}

describe('Translator', () => {
  it('replaces a top-level string that matches a translation key', () => {
    expect(createTranslator().translateObject('Hello world')).toBe('Привет мир')
  })

  it('translates string values in a flat object', () => {
    const result = createTranslator().translateObject({ greeting: 'Hello world' })
    expect(result).toEqual({ greeting: 'Привет мир' })
  })

  it('translates string values in nested objects recursively', () => {
    const result = createTranslator().translateObject({
      user: {
        name: 'Hello world',
        address: {
          greeting: 'Good morning',
        },
      },
    })
    expect(result).toEqual({
      user: {
        name: 'Привет мир',
        address: {
          greeting: 'Доброе утро',
        },
      },
    })
  })

  it('translates string values inside arrays', () => {
    const result = createTranslator().translateObject(['Hello world', { phrase: 'Good morning' }])
    expect(result).toEqual(['Привет мир', { phrase: 'Доброе утро' }])
  })

  it('keeps unknown strings untouched', () => {
    const result = createTranslator().translateObject({ text: 'Not in dictionary' })
    expect(result).toEqual({ text: 'Not in dictionary' })
  })

  it('keeps non-string values untouched', () => {
    const result = createTranslator().translateObject({
      count: 42,
      flag: true,
      nothing: null,
      missing: undefined,
    })
    expect(result).toEqual({
      count: 42,
      flag: true,
      nothing: null,
      missing: undefined,
    })
  })

  it('does not translate object keys, only string values', () => {
    const result = createTranslator().translateObject({ name: 'John' })
    expect(result).toEqual({ name: 'John' })
  })

  it('returns a deep copy and does not mutate the input', () => {
    const input = {
      greeting: 'Hello world',
      nested: { greeting: 'Good morning', list: ['Hello world'] },
    }
    const result = createTranslator().translateObject(input)

    expect(result).toEqual({
      greeting: 'Привет мир',
      nested: { greeting: 'Доброе утро', list: ['Привет мир'] },
    })
    expect(result).not.toBe(input)
    expect(result.nested).not.toBe(input.nested)
    expect(result.nested.list).not.toBe(input.nested.list)
    expect(input).toEqual({
      greeting: 'Hello world',
      nested: { greeting: 'Good morning', list: ['Hello world'] },
    })
  })

  it('uses own translations and ignores inherited properties', () => {
    const source = { __proto__: { toString: 'should not resolve' } }
    const translator = new Translator({ toString: 'translated' })
    expect(translator.translateObject(source)).toEqual({})
  })

  it('handles empty objects and arrays', () => {
    expect(createTranslator().translateObject({})).toEqual({})
    expect(createTranslator().translateObject([])).toEqual([])
  })

  it('works without translations', () => {
    const translator = new Translator()
    expect(translator.translateObject('Hello world')).toBe('Hello world')
  })
})

describe('Translator.translateNode', () => {
  function createElement(html) {
    const el = document.createElement('div')
    el.innerHTML = html
    return el
  }

  it('translates plain text inside an element', () => {
    const el = createElement('Hello world')
    createTranslator().translateNode(el)
    expect(el.textContent).toBe('Привет мир')
  })

  it('translates text nodes recursively in nested elements', () => {
    const el = createElement('<div><span>Hello world</span><p>Good morning</p></div>')
    createTranslator().translateNode(el)
    expect(el.innerHTML).toBe('<div><span>Привет мир</span><p>Доброе утро</p></div>')
  })

  it('preserves leading and trailing whitespace around translated text', () => {
    const el = createElement('  Hello world  ')
    createTranslator().translateNode(el)
    expect(el.textContent).toBe('  Привет мир  ')
  })

  it('preserves whitespace text nodes between elements', () => {
    const el = createElement('<span>Hello world</span> <span>Good morning</span>')
    createTranslator().translateNode(el)
    expect(el.innerHTML).toBe('<span>Привет мир</span> <span>Доброе утро</span>')
  })

  it('handles trailing newline as trailing whitespace', () => {
    const el = createElement('<p>Hello world\n</p>')
    createTranslator().translateNode(el)
    expect(el.innerHTML).toBe('<p>Привет мир\n</p>')
  })

  it('translates a direct text node argument', () => {
    const textNode = document.createTextNode('Hello world')
    createTranslator().translateNode(textNode)
    expect(textNode.nodeValue).toBe('Привет мир')
  })

  it('leaves unknown text untouched', () => {
    const el = createElement('Something unknown')
    createTranslator().translateNode(el)
    expect(el.innerHTML).toBe('Something unknown')
  })

  it('does not replace text when the joined result equals the original', () => {
    const translator = new Translator({ same: 'same' })
    const el = createElement('same')
    translator.translateNode(el)
    expect(el.innerHTML).toBe('same')
  })

  it('leaves whitespace-only text nodes unchanged', () => {
    const el = createElement('   ')
    createTranslator().translateNode(el)
    expect(el.innerHTML).toBe('   ')
  })

  it('does not mutate non-translatable nodes like attributes', () => {
    const el = createElement('<span title="Hello world">Good morning</span>')
    createTranslator().translateNode(el)
    expect(el.querySelector('span').title).toBe('Hello world')
  })
})
