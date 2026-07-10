import ansiAnd from './gates/ansi-and.svg?raw'
import ansiOr from './gates/ansi-or.svg?raw'
import ansiNot from './gates/ansi-not.svg?raw'
import ansiNand from './gates/ansi-nand.svg?raw'
import ansiNor from './gates/ansi-nor.svg?raw'
import ansiXor from './gates/ansi-xor.svg?raw'
import ansiXnor from './gates/ansi-xnor.svg?raw'
import iecAnd from './gates/iec-and.svg?raw'
import iecOr from './gates/iec-or.svg?raw'
import iecNot from './gates/iec-not.svg?raw'
import iecNand from './gates/iec-nand.svg?raw'
import iecNor from './gates/iec-nor.svg?raw'
import iecXor from './gates/iec-xor.svg?raw'
import iecXnor from './gates/iec-xnor.svg?raw'

function extractBody(raw) {
  let m = raw.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/g, '')
  m = m.replace(/<svg[^>]*>/g, '').replace(/<\/svg>/g, '')
  m = m.replace(/style="fill-opacity:[^"]*"/g, '')
  return m.trim()
}

const RAW = {
  ansi: {
    and: extractBody(ansiAnd),
    or: extractBody(ansiOr),
    not: extractBody(ansiNot),
    nand: extractBody(ansiNand),
    nor: extractBody(ansiNor),
    xor: extractBody(ansiXor),
    xnor: extractBody(ansiXnor),
  },
  iec: {
    and: extractBody(iecAnd),
    or: extractBody(iecOr),
    not: extractBody(iecNot),
    nand: extractBody(iecNand),
    nor: extractBody(iecNor),
    xor: extractBody(iecXor),
    xnor: extractBody(iecXnor),
  },
}

function svgData(style, id, inputY, outputY) {
  return {
    markup: RAW[style][id],
    viewBox: style === 'iec' ? { w: 128, h: 74 } : { w: 100, h: 50 },
    inputY,
    outputY,
  }
}

export const GATES = {
  not: {
    id: 'not',
    label: 'NOT',
    inputs: 1,
    fn: (a) => a ? 0 : 1,
    truthTable: () => [
      { inputs: [0], output: 1 },
      { inputs: [1], output: 0 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'not', [37], 37)
        : svgData('ansi', 'not', [25], 25)
    },
  },

  and: {
    id: 'and',
    label: 'AND',
    inputs: 2,
    fn: (a, b) => a && b ? 1 : 0,
    truthTable: () => [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'and', [18, 56], 37)
        : svgData('ansi', 'and', [15, 35], 25)
    },
  },

  or: {
    id: 'or',
    label: 'OR',
    inputs: 2,
    fn: (a, b) => a || b ? 1 : 0,
    truthTable: () => [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 1 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'or', [18, 56], 37)
        : svgData('ansi', 'or', [15, 35], 25)
    },
  },

  nand: {
    id: 'nand',
    label: 'NAND',
    inputs: 2,
    fn: (a, b) => a && b ? 0 : 1,
    truthTable: () => [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'nand', [18, 56], 37)
        : svgData('ansi', 'nand', [15, 35], 25)
    },
  },

  nor: {
    id: 'nor',
    label: 'NOR',
    inputs: 2,
    fn: (a, b) => a || b ? 0 : 1,
    truthTable: () => [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 0 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'nor', [18, 56], 37)
        : svgData('ansi', 'nor', [15, 35], 25)
    },
  },

  xor: {
    id: 'xor',
    label: 'XOR',
    inputs: 2,
    fn: (a, b) => a !== b ? 1 : 0,
    truthTable: () => [
      { inputs: [0, 0], output: 0 },
      { inputs: [0, 1], output: 1 },
      { inputs: [1, 0], output: 1 },
      { inputs: [1, 1], output: 0 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'xor', [18, 56], 37)
        : svgData('ansi', 'xor', [15, 35], 25)
    },
  },

  xnor: {
    id: 'xnor',
    label: 'XNOR',
    inputs: 2,
    fn: (a, b) => a === b ? 1 : 0,
    truthTable: () => [
      { inputs: [0, 0], output: 1 },
      { inputs: [0, 1], output: 0 },
      { inputs: [1, 0], output: 0 },
      { inputs: [1, 1], output: 1 },
    ],
    svg(style) {
      return style === 'iec'
        ? svgData('iec', 'xnor', [18, 56], 37)
        : svgData('ansi', 'xnor', [15, 35], 25)
    },
  },
}
