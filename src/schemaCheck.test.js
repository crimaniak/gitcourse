// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkSchemaAgainstReferences, SCHEMA_EQUIVALENCY_GROUPS } from './courses/boolean-functions/schemaCheck.js'
import { BOOLEAN_COURSE, REFERENCE_SCHEMAS } from './courses/boolean-functions/index.js'

class FakeSchemaComparator {
  constructor(options) {
    FakeSchemaComparator.lastOptions = options
  }

  compare(reference, schema) {
    const ids = s => (s.devices || []).map(d => d.id)
    const conns = s => (s.connectors || []).map(c => c.from + '>' + c.to)
    const missing = ids(reference).filter(id => !ids(schema).includes(id))
    const extra = ids(schema).filter(id => !ids(reference).includes(id))
    const cMissing = conns(reference).filter(c => !conns(schema).includes(c))
      .map(c => ({ connection: c }))
    const cExtra = conns(schema).filter(c => !conns(reference).includes(c))
      .map(c => ({ connection: c }))
    return {
      equal: missing.length === 0 && extra.length === 0 && cMissing.length === 0 && cExtra.length === 0,
      devices: { missing, extra, mismatches: [] },
      connections: { missing: cMissing, extra: cExtra },
    }
  }
}

const REF = REFERENCE_SCHEMAS.DC_LED

function page(id) {
  return BOOLEAN_COURSE.pages.find(p => p.id === id)
}

describe('checkSchemaAgainstReferences', () => {
  beforeEach(() => {
    window.simcir = { SchemaComparator: FakeSchemaComparator }
  })

  afterEach(() => {
    delete window.simcir
  })

  it('passes when the schema matches the reference', () => {
    const result = checkSchemaAgainstReferences(REF, REF)
    expect(result.correct).toBe(true)
  })

  it('passes when any of several reference variants matches', () => {
    const refB = {
      devices: [{ type: 'LED', id: 'b', label: 'LED' }],
      connectors: [],
    }
    const schema = {
      devices: [{ type: 'LED', id: 'b', label: 'LED' }],
      connectors: [],
    }
    const result = checkSchemaAgainstReferences(schema, [REF, refB])
    expect(result.correct).toBe(true)
  })

  it('reports a diff hint on mismatch', () => {
    const schema = {
      devices: [{ type: 'DC', id: 'dc', label: 'DC' }],
      connectors: [],
    }
    const result = checkSchemaAgainstReferences(schema, REF)
    expect(result.correct).toBe(false)
    expect(result.hint).toContain("Circuit doesn't match the target schematic.")
    expect(result.hint).toContain('Missing devices:')
    expect(result.hint).toContain('LED')
    expect(result.hint).toContain('Wiring differs from the expected circuit.')
  })

  it('reports extra devices on mismatch', () => {
    const schema = {
      devices: [...REF.devices, { type: 'BUF', id: 'x', label: 'BUF' }],
      connectors: [...REF.connectors],
    }
    const result = checkSchemaAgainstReferences(schema, REF)
    expect(result.correct).toBe(false)
    expect(result.hint).toContain('Extra devices:')
    expect(result.hint).toContain('BUF')
  })

  it('handles a missing live schema', () => {
    const result = checkSchemaAgainstReferences(null, REF)
    expect(result.correct).toBe(false)
    expect(result.hint).toBe('Build the circuit on the field first.')
  })

  it('handles an unavailable comparator gracefully', () => {
    delete window.simcir
    const result = checkSchemaAgainstReferences(REF, REF)
    expect(result.correct).toBe(false)
    expect(result.hint).toBe('Circuit checker is not available.')
  })

  it('forwards equivalency groups and omit attributes to the comparator', () => {
    checkSchemaAgainstReferences(REF, REF)
    const opts = FakeSchemaComparator.lastOptions
    expect(opts.equivalencyGroups).toEqual(SCHEMA_EQUIVALENCY_GROUPS)
    expect(opts.equivalencyGroups.NAND).toEqual({ inputs: [['in*']] })
    for (const attr of ['x', 'y', 'state', 'maxCount', 'labelMask']) {
      expect(opts.omitAttributes).toContain(attr)
    }
  })
})

describe('course pages use schema checks', () => {
  beforeEach(() => {
    window.simcir = { SchemaComparator: FakeSchemaComparator }
  })

  afterEach(() => {
    delete window.simcir
  })

  it('connect-nodes passes with a matching schema', () => {
    expect(page('connect-nodes').checkSolution([], [], null, () => {}, REF).correct).toBe(true)
  })

  it('connect-nodes falls back to signal checks without a schema', () => {
    const result = page('connect-nodes').checkSolution([], [], null, () => {}, undefined)
    expect(result.correct).toBe(false)
    expect(result.hint).toBe('Could not read signals.')
  })

  it('buffer passes with a matching schema', () => {
    expect(page('buffer').checkSolution([], [], null, () => {}, REFERENCE_SCHEMAS.DC_TOGGLE_BUF_LED).correct).toBe(true)
  })

  it('build-pushon requires the truth table after the schema passes', () => {
    const result = page('build-pushon').checkSolution([], [], null, () => {}, REFERENCE_SCHEMAS.DC_PUSHON_LED)
    expect(result.correct).toBe(false)
    expect(result.hint).toBe('Complete the truth table.')
  })

  it('rs-trigger accepts both of its reference variants', () => {
    expect(REFERENCE_SCHEMAS.RS_TRIGGER.length).toBe(2)
    for (const ref of REFERENCE_SCHEMAS.RS_TRIGGER) {
      const result = page('rs-trigger').checkSolution(
        [], [], null, () => {}, JSON.parse(JSON.stringify(ref)))
      expect(result.correct).toBe(true)
    }
  })

  it('d-trigger accepts its reference variants and falls back behaviorally', () => {
    expect(REFERENCE_SCHEMAS.D_TRIGGER.length).toBe(2)
    const matching = page('d-trigger').checkSolution(
      [], [], null, () => {}, JSON.parse(JSON.stringify(REFERENCE_SCHEMAS.D_TRIGGER[0])))
    expect(matching.correct).toBe(true)

    const notMatching = page('d-trigger').checkSolution([], [], null, () => {},
      { devices: [], connectors: [] })
    expect(notMatching.correct).toBe(false)
    expect(notMatching.hint).toContain('Build the D trigger')
  })

  it('jk-trigger accepts its reference variants and falls back behaviorally', () => {
    expect(REFERENCE_SCHEMAS.JK_TRIGGER.length).toBe(2)
    const matching = page('jk-trigger').checkSolution(
      [], [], null, () => {}, JSON.parse(JSON.stringify(REFERENCE_SCHEMAS.JK_TRIGGER[0])))
    expect(matching.correct).toBe(true)

    const notMatching = page('jk-trigger').checkSolution([], [], null, () => {},
      { devices: [], connectors: [] })
    expect(notMatching.correct).toBe(false)
    expect(notMatching.hint).toContain('Build the JK trigger')
  })

  it('non-editable pages are unaffected by the schema argument', () => {
    const result = page('and').checkSolution([], [], null, () => {}, {})
    expect(result.correct).toBe(false)
    expect(result.hint).toBe('Complete the truth table.')
  })
})
