import { Translator } from '../Translator.js'
import es from './es.js'
import de from './de.js'
import uk from './uk.js'

export const LANGUAGES = ['en', 'es', 'de', 'uk']

export const dictionaries = { es, de, uk }

export function createTranslator(language) {
  return new Translator(language === 'en' ? {} : dictionaries[language] || {})
}
