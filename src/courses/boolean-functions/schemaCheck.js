import { getLanguage } from '../../storage.js'
import { createTranslator } from '../../i18n/index.js'

export const SCHEMA_EQUIVALENCY_GROUPS = {
  NAND: { inputs: [['in*']] },
  AND: { inputs: [['in*']] },
  OR: { inputs: [['in*']] },
  XOR: { inputs: [['in*']] },
  NOR: { inputs: [['in*']] },
  XNOR: { inputs: [['in*']] },
}

function getSimcir() {
  try {
    return typeof window !== 'undefined' ? window.simcir : undefined
  } catch (e) {
    return undefined
  }
}

function translate(text) {
  return createTranslator(getLanguage()).translateObject(text)
}

// Maps device ids back to types for hint messages. Covers both raw ids and
// SchemaComparator's normalizeSchemaIds numbering ('dev0', 'dev1', ...),
// because compare() reports ids from the normalized schemas.
function normalizedTypeMap(schema) {
  const devices = [...(schema.devices || [])].sort((a, b) =>
    a.type < b.type ? -1 : a.type > b.type ? 1 : 0)
  const map = {}
  devices.forEach((d, i) => {
    map['dev' + i] = d.type
    if (d.id) map[d.id] = d.type
  })
  return map
}

function countProblems(result) {
  if (!result) return Infinity
  return result.devices.missing.length +
    result.devices.extra.length +
    result.devices.mismatches.length +
    result.connections.missing.length +
    result.connections.extra.length
}

function describeDiff(schema, reference, result) {
  const t = text => translate(text)
  const parts = [t("Circuit doesn't match the target schematic.")]

  const refTypes = normalizedTypeMap(reference)
  const schemaTypes = normalizedTypeMap(schema)

  const missing = [...new Set(result.devices.missing.map(id => refTypes[id]).filter(Boolean))]
  if (missing.length > 0) {
    parts.push(`${t('Missing devices:')} ${missing.join(', ')}`)
  }
  const extra = [...new Set(result.devices.extra.map(id => schemaTypes[id]).filter(Boolean))]
  if (extra.length > 0) {
    parts.push(`${t('Extra devices:')} ${extra.join(', ')}`)
  }
  if (result.devices.mismatches.length > 0) {
    parts.push(t('Check device labels and properties.'))
  }
  if (result.connections.missing.length > 0 || result.connections.extra.length > 0) {
    parts.push(t('Wiring differs from the expected circuit.'))
  }
  return parts.join(' ')
}

export function checkSchemaAgainstReferences(schema, references) {
  if (!schema || !Array.isArray(schema.devices)) {
    return { correct: false, hint: translate('Build the circuit on the field first.') }
  }
  const sim = getSimcir()
  if (!sim || !sim.SchemaComparator) {
    return { correct: false, hint: translate('Circuit checker is not available.') }
  }

  const list = Array.isArray(references) ? references : [references]
  const comparator = new sim.SchemaComparator({
    equivalencyGroups: SCHEMA_EQUIVALENCY_GROUPS,
    // x/y/state omitted by library defaults; label/maxCount/labelMask leak
    // into deviceDefs and are not part of the circuit.
    omitAttributes: ['x', 'y', 'state', 'label', 'maxCount', 'labelMask'],
  })

  let bestResult = null
  let bestIndex = -1
  for (let i = 0; i < list.length; i++) {
    const result = comparator.compare(list[i], schema)
    if (result.equal) return { correct: true }
    if (countProblems(result) < countProblems(bestResult)) {
      bestResult = result
      bestIndex = i
    }
  }
  const bestRef = bestIndex >= 0 ? list[bestIndex] : list[0]
  return { correct: false, hint: describeDiff(schema, bestRef, bestResult) }
}
