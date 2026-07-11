export function signalValue(signals, deviceId, nodeIndex, type) {
  const s = signals.find(sig =>
    sig.deviceId === deviceId && sig.index === nodeIndex && sig.type === (type || 'out')
  )
  return s && s.value != null ? s.value : null
}

export function connectionExists(signals, fromId, fromIndex, toId, toIndex) {
  const fromSig = signals.find(s =>
    s.deviceId === fromId && s.index === fromIndex && s.type === 'out'
  )
  const toSig = signals.find(s =>
    s.deviceId === toId && s.index === toIndex && s.type === 'in'
  )
  return fromSig && toSig && fromSig.value === toSig.value
}

export function gatesTruthTable(tableData, numInputs, expected) {
  const rows = 1 << numInputs
  for (let i = 0; i < rows; i++) {
    if (!tableData[i] || !tableData[i].filled) return false
    if (tableData[i].outputs[0] !== expected[i]) return false
  }
  return true
}

const NOT_TABLE = [1, 0]
const AND_TABLE = [0, 0, 0, 1]
const NAND_TABLE = [1, 1, 1, 0]
const OR_TABLE = [0, 1, 1, 1]
const NOR_TABLE = [1, 0, 0, 0]
const XOR_TABLE = [0, 1, 1, 0]
const XNOR_TABLE = [1, 0, 0, 1]

export const EXPECTED = { not: NOT_TABLE, and: AND_TABLE, nand: NAND_TABLE, or: OR_TABLE, nor: NOR_TABLE, xor: XOR_TABLE, xnor: XNOR_TABLE }

const RS_TABLE = [
  [1, 0],
  [0, 1],
  [1, 0],
  ['?', '?'],
]

const JK_TABLE = [
  [0, 1],
  [1, 0],
  [0, 1],
  [1, 0],
  ['?', '?'],
  ['?', '?'],
  ['?', '?'],
  ['?', '?'],
]

const D_TABLE = [
  [0, 1],
  [1, 0],
  [0, 1],
  [1, 0],
]

export const TRIGGER_TABLES = {
  rs: RS_TABLE,
  jk: JK_TABLE,
  d: D_TABLE,
}
