// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createApp, nextTick, reactive } from 'petite-vue'
import { createTranslator, dictionaries, LANGUAGES } from './i18n/index.js'
import { createTranslateDirective } from './i18n/translateDirective.js'
import { Translator } from './Translator.js'
import { BOOLEAN_COURSE } from './courses/boolean-functions/index.js'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('dictionaries', () => {
  const langs = ['es', 'de', 'uk']
  const esKeys = Object.keys(dictionaries.es).sort()

  it('cover the same keys in every language', () => {
    for (const lang of langs) {
      expect(Object.keys(dictionaries[lang]).sort()).toEqual(esKeys)
    }
  })

  it('have non-empty translations for every key', () => {
    for (const lang of langs) {
      for (const key of esKeys) {
        expect(dictionaries[lang][key], `${lang}: ${key}`).toBeTruthy()
      }
    }
  })

  it('do not include technical device labels as keys', () => {
    const labels = ['DC', 'LED', 'PushOn', 'PushOff', 'Toggle', 'BUF', 'NOT', 'AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR', 'A', 'B', 'OUT', 'Q', '~Q', 'J', 'K', 'D', 'T', 'CLK', 'RS-FF', '8bitCounter']
    for (const lang of langs) {
      for (const label of labels) {
        expect(dictionaries[lang], `${lang}: ${label}`).not.toHaveProperty(label)
      }
    }
  })

  it('do not contain template mustaches in keys', () => {
    for (const lang of langs) {
      for (const key of Object.keys(dictionaries[lang])) {
        expect(key).not.toContain('{{')
      }
    }
  })

  it('exposes the expected language codes', () => {
    expect(LANGUAGES).toEqual(['en', 'es', 'de', 'uk'])
  })
})

describe('Translator with dictionaries', () => {
  it('creates a no-op translator for English', () => {
    const en = createTranslator('en')
    expect(en.translateObject('Boolean Electronics')).toBe('Boolean Electronics')
  })

  it('translates course objects before usage', () => {
    const uk = createTranslator('uk')
    const copy = uk.translateObject(BOOLEAN_COURSE)

    expect(copy).not.toBe(BOOLEAN_COURSE)
    expect(copy.title).toBe('Булева електроніка')
    expect(copy.pages[0].title).toBe('З\u0027єднати вузли')
    expect(copy.pages[0].subtitle).toBe('Ваша перша схема')
  })

  it('keeps device labels and checkSolution functions untouched in translated courses', () => {
    const uk = createTranslator('uk')
    const copy = uk.translateObject(BOOLEAN_COURSE)
    const page = copy.pages[0]

    expect(page.checkSolution).toBe(BOOLEAN_COURSE.pages[0].checkSolution)
    expect(page.simulation.devices[0].label).toBe('DC')
    expect(page.simulation.devices[1].label).toBe('LED')
    expect(page.tableConfig).toBe(null)
  })

  it('translates checkSolution hints at runtime', () => {
    const de = createTranslator('de')
    expect(de.translateObject('Complete the truth table.')).toBe('Vervollständige die Wahrheitstabelle.')
    expect(de.translateObject('Fill all rows.')).toBe('Fülle alle Zeilen.')
  })

  it('translates UI strings', () => {
    const es = createTranslator('es')
    expect(es.translateObject('Check Solution')).toBe('Comprobar solución')
    expect(es.translateObject('Available Courses')).toBe('Cursos disponibles')
  })
})

describe('createTranslateDirective', () => {
  function mount(template, state, translator) {
    const el = document.createElement('div')
    el.setAttribute('v-scope', '')
    el.setAttribute('v-translate', '')
    el.innerHTML = template
    document.body.appendChild(el)
    createApp(state)
      .directive('translate', createTranslateDirective(translator))
      .mount(el)
    return el
  }

  it('translates text nodes after the initial render', async () => {
    const el = mount('<span>Hello world</span>', { _revision: 0 }, new Translator({ 'Hello world': 'Привіт світ' }))
    await flush()
    expect(el.textContent).toBe('Привіт світ')
  })

  it('re-translates text after a _revision bump', async () => {
    const state = reactive({ _revision: 0, flag: false })
    const el = mount(`<span>{{ flag ? 'Hello world' : 'Goodbye' }}</span>`, state, new Translator({ 'Hello world': 'Привіт світ' }))
    await flush()
    expect(el.textContent).toBe('Goodbye')

    state.flag = true
    await nextTick()
    expect(el.textContent).toBe('Hello world')

    state._revision++
    await flush()
    expect(el.textContent).toBe('Привіт світ')
  })

  it('translates static fragments next to interpolations', async () => {
    const uk = createTranslator('uk')
    const el = mount('<h1><span>Welcome,</span> Player!</h1><a><span>← Back to</span> Boolean Electronics</a>', { _revision: 0 }, uk)
    await flush()
    expect(el.querySelector('h1 span').textContent).toBe('Ласкаво просимо,')
    expect(el.querySelector('a span').textContent).toBe('← Назад до')
    expect(el.querySelector('h1').childNodes[1].textContent).toBe(' Player!')
  })
})
