import { checkSchemaAgainstReferences } from './schemaCheck.js'

const SIM_W = 600
const SIM_H = 260

// Reference schematics for tasks where the user edits the circuit.
// Ids are arbitrary (SchemaComparator ignores them); device types and wiring
// are compared, labels are ignored.
const REF_DC_LED = {
  devices: [
    { type: 'DC', id: 'dc' },
    { type: 'LED', id: 'led' },
  ],
  connectors: [
    { from: 'dc.out0', to: 'led.in0' },
  ],
}

const REF_DC_PUSHON_LED = {
  devices: [
    { type: 'DC', id: 'dc' },
    { type: 'PushOn', id: 'btn' },
    { type: 'LED', id: 'led' },
  ],
  connectors: [
    { from: 'dc.out0', to: 'btn.in0' },
    { from: 'btn.out0', to: 'led.in0' },
  ],
}

const REF_DC_PUSHOFF_LED = {
  devices: [
    { type: 'DC', id: 'dc' },
    { type: 'PushOff', id: 'btn' },
    { type: 'LED', id: 'led' },
  ],
  connectors: [
    { from: 'dc.out0', to: 'btn.in0' },
    { from: 'btn.out0', to: 'led.in0' },
  ],
}

const REF_DC_TOGGLE_LED = {
  devices: [
    { type: 'DC', id: 'dc' },
    { type: 'Toggle', id: 'tog' },
    { type: 'LED', id: 'led' },
  ],
  connectors: [
    { from: 'dc.out0', to: 'tog.in0' },
    { from: 'tog.out0', to: 'led.in0' },
  ],
}

const REF_DC_TOGGLE_BUF_LED = {
  devices: [
    { type: 'DC', id: 'dc' },
    { type: 'Toggle', id: 'tog' },
    { type: 'BUF', id: 'buf' },
    { type: 'LED', id: 'led' },
  ],
  connectors: [
    { from: 'dc.out0', to: 'tog.in0' },
    { from: 'tog.out0', to: 'buf.in0' },
    { from: 'buf.out0', to: 'led.in0' },
  ],
}

const REF_BUILD_NOT = {
  devices: [
    { type: 'DC', id: 'dc' },
    { type: 'Toggle', id: 'tog' },
    { type: 'NOT', id: 'gate' },
    { type: 'LED', id: 'led' },
  ],
  connectors: [
    { from: 'dc.out0', to: 'tog.in0' },
    { from: 'tog.out0', to: 'gate.in0' },
    { from: 'gate.out0', to: 'led.in0' },
  ],
}

// RS latch: two valid role assignments (either NAND may take the Set side).
const REF_RS_TRIGGER = [0, 1].map(swapped => {
  const na = swapped ? 'nb' : 'na'
  const nb = swapped ? 'na' : 'nb'
  return {
    devices: [
      { type: 'DC', id: 'dc' },
      { type: 'PushOff', id: 'pbS' },
      { type: 'PushOff', id: 'pbR' },
      { type: 'NAND', id: 'na' },
      { type: 'NAND', id: 'nb' },
      { type: 'LED', id: 'ledQ' },
      { type: 'LED', id: 'ledNQ' },
    ],
    connectors: [
      { from: 'dc.out0', to: 'pbS.in0' },
      { from: 'dc.out0', to: 'pbR.in0' },
      { from: 'pbS.out0', to: na + '.in0' },
      { from: nb + '.out0', to: na + '.in1' },
      { from: 'pbR.out0', to: nb + '.in0' },
      { from: na + '.out0', to: nb + '.in1' },
      { from: na + '.out0', to: 'ledQ.in0' },
      { from: nb + '.out0', to: 'ledNQ.in0' },
    ],
  }
})

// Gated D latch: either physical NAND may take the Set side.
const REF_D_TRIGGER = [0, 1].map(swapped => {
  const ns = swapped ? 'nandR' : 'nandS'
  const nr = swapped ? 'nandS' : 'nandR'
  return {
    devices: [
      { type: 'DC', id: 'dc' },
      { type: 'Toggle', id: 'togD' },
      { type: 'PushOn', id: 'pbClk' },
      { type: 'NOT', id: 'not' },
      { type: 'NAND', id: 'nandS' },
      { type: 'NAND', id: 'nandR' },
      { type: 'RS-FF', id: 'rs' },
      { type: 'LED', id: 'ledQ' },
      { type: 'LED', id: 'ledNQ' },
    ],
    connectors: [
      { from: 'dc.out0', to: 'togD.in0' },
      { from: 'dc.out0', to: 'pbClk.in0' },
      { from: 'togD.out0', to: 'not.in0' },
      { from: 'togD.out0', to: ns + '.in0' },
      { from: 'pbClk.out0', to: ns + '.in1' },
      { from: ns + '.out0', to: 'rs.in0' },
      { from: 'pbClk.out0', to: nr + '.in0' },
      { from: 'not.out0', to: nr + '.in1' },
      { from: nr + '.out0', to: 'rs.in1' },
      { from: 'rs.out0', to: 'ledQ.in0' },
      { from: 'rs.out1', to: 'ledNQ.in0' },
    ],
  }
})

// Gated JK latch: either physical NAND may take the J side.
const REF_JK_TRIGGER = [0, 1].map(swapped => {
  const nj = swapped ? 'nandK' : 'nandJ'
  const nk = swapped ? 'nandJ' : 'nandK'
  return {
    devices: [
      { type: 'DC', id: 'dc' },
      { type: 'Toggle', id: 'togJ' },
      { type: 'PushOn', id: 'pbClk' },
      { type: 'Toggle', id: 'togK' },
      { type: 'NAND', id: 'nandJ' },
      { type: 'NAND', id: 'nandK' },
      { type: 'RS-FF', id: 'rs' },
      { type: 'LED', id: 'ledQ' },
      { type: 'LED', id: 'ledNQ' },
    ],
    connectors: [
      { from: 'dc.out0', to: 'togJ.in0' },
      { from: 'dc.out0', to: 'pbClk.in0' },
      { from: 'dc.out0', to: 'togK.in0' },
      { from: 'togJ.out0', to: nj + '.in0' },
      { from: 'pbClk.out0', to: nj + '.in1' },
      { from: nj + '.out0', to: 'rs.in0' },
      { from: 'togK.out0', to: nk + '.in0' },
      { from: 'pbClk.out0', to: nk + '.in1' },
      { from: nk + '.out0', to: 'rs.in1' },
      { from: 'rs.out0', to: 'ledQ.in0' },
      { from: 'rs.out1', to: 'ledNQ.in0' },
    ],
  }
})

export const REFERENCE_SCHEMAS = {
  DC_LED: REF_DC_LED,
  DC_PUSHON_LED: REF_DC_PUSHON_LED,
  DC_PUSHOFF_LED: REF_DC_PUSHOFF_LED,
  DC_TOGGLE_LED: REF_DC_TOGGLE_LED,
  DC_TOGGLE_BUF_LED: REF_DC_TOGGLE_BUF_LED,
  BUILD_NOT: REF_BUILD_NOT,
  RS_TRIGGER: REF_RS_TRIGGER,
  D_TRIGGER: REF_D_TRIGGER,
  JK_TRIGGER: REF_JK_TRIGGER,
}

function checkTruthTable(tableData, incorrectHint, incompleteHint = 'Fill all rows of the truth table.') {
  if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
  if (!tableData.isComplete()) return { correct: false, hint: incompleteHint }
  if (!tableData.isCorrect()) return { correct: false, hint: incorrectHint }
  return { correct: true }
}

function checkTriggerLit(signals, resolve, outputLabels, hint) {
  const lit = outputLabels.some(label => {
    const s = signals.find(sig => sig.deviceId === resolve(label) && sig.type === 'in')
    return s && s.value != null
  })
  return lit ? { correct: true } : { correct: false, hint }
}

export const BOOLEAN_COURSE = {
  id: 'boolean-electronics',
  title: 'Boolean Electronics',
  description: 'Interactive course about logic gates, triggers, and counters. Build circuits, complete truth tables, and discover how computers work at the lowest level.',
  icon: '🔌',
  pages: [
    // ─── Task 1: Connect Nodes ───
    {
      id: 'connect-nodes',
      title: 'Connect Nodes',
      subtitle: 'Your first circuit',
      description: 'On the scheme below you see a DC source (power supply) on the left and an LED on the right. Your task is to connect the DC output to the LED input. Press and hold on a connector point (small circle) on the DC output, drag the wire to a connector point on the LED input, and release the mouse button there — a wire will appear.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'LED', id: 'led', x: SIM_W - 96, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) {
          const dcOut = signals.find(s => s.deviceId === resolve('DC') && s.type === 'out')
          const ledIn = signals.find(s => s.deviceId === resolve('LED') && s.type === 'in')
          if (!dcOut || !ledIn) return { correct: false, hint: 'Could not read signals.' }
          if (ledIn.value != null) return { correct: true }
          return { correct: false, hint: 'The LED is not lit. Make sure you connected the DC output to the LED input.' }
        }
        return checkSchemaAgainstReferences(schema, REF_DC_LED)
      },
    },

    // ─── Task 2: Build a Circuit ───
    {
      id: 'build-connect',
      title: 'Build a Circuit',
      subtitle: 'From scratch',
      description: 'Now build a circuit from scratch. Drag a DC source and an LED from the toolbox onto the field. Place the DC on the left and the LED on the right. Then connect the DC output to the LED input to light it up.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'DC', maxCount: 1 },
          { type: 'LED', maxCount: 1 },
        ],
        devices: [],
        connectors: [],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) {
          const dcOut = signals.find(s => s.deviceId === resolve('DC') && s.type === 'out')
          const ledIn = signals.find(s => s.deviceId === resolve('LED') && s.type === 'in')
          if (!dcOut || !ledIn) return { correct: false, hint: 'Add a DC source and an LED to the field.' }
          if (ledIn.value != null) return { correct: true }
          return { correct: false, hint: 'Connect DC output to LED input.' }
        }
        return checkSchemaAgainstReferences(schema, REF_DC_LED)
      },
    },

    // ─── Task 3: PushOn ───
    {
      id: 'pushon',
      title: 'PushOn Button',
      subtitle: 'Momentary contact',
      description: 'Now add a PushOn button between the DC source and the LED. Connect: DC → PushOn → LED. Then press the button to see the LED light up — it only lights while you hold the button down. Complete the truth table to verify the behavior.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'PushOn', id: 'btn', x: 128, y: SIM_H / 2 - 16, label: 'PushOn' },
          { type: 'LED', id: 'led', x: 300, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: { inputLabels: ['PushOn'], outputLabels: ['LED'], numInputs: 1, expected: [0, 1] },
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) return checkTruthTable(tableData, 'Some rows are incorrect. PushOn passes signal only while pressed.')
        const schemaResult = checkSchemaAgainstReferences(schema, REF_DC_PUSHON_LED)
        if (!schemaResult.correct) return schemaResult
        return checkTruthTable(tableData, 'Some rows are incorrect. PushOn passes signal only while pressed.')
        return { correct: true }
      },
    },

    // ─── Task 4: Build a PushOn Circuit ───
    {
      id: 'build-pushon',
      title: 'Build a PushOn Circuit',
      subtitle: 'Add a button',
      description: 'Build the PushOn circuit from scratch. Drag a DC source, a PushOn button, and an LED from the toolbox. Wire them: DC → PushOn → LED. Then press the button and complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'DC', maxCount: 1 },
          { type: 'PushOn', maxCount: 1 },
          { type: 'LED', maxCount: 1 },
        ],
        devices: [],
        connectors: [],
      },
      tableConfig: { inputLabels: ['PushOn'], outputLabels: ['LED'], numInputs: 1, expected: [0, 1] },
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) return checkTruthTable(tableData, 'Some rows are incorrect. PushOn passes signal only while pressed.')
        const schemaResult = checkSchemaAgainstReferences(schema, REF_DC_PUSHON_LED)
        if (!schemaResult.correct) return schemaResult
        return checkTruthTable(tableData, 'Some rows are incorrect. PushOn passes signal only while pressed.')
        return { correct: true }
      },
    },

    // ─── Task 5: PushOff ───
    {
      id: 'pushoff',
      title: 'PushOff Button',
      subtitle: 'Normally closed',
      description: 'Similar to the previous task, but with a PushOff button. With a PushOff, the signal flows normally (LED is on), but when you press the button the signal is interrupted (LED turns off). Complete the truth table to verify the behavior.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'PushOff', id: 'btn', x: 128, y: SIM_H / 2 - 16, label: 'PushOff' },
          { type: 'LED', id: 'led', x: 300, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: { inputLabels: ['PushOff'], outputLabels: ['LED'], numInputs: 1, expected: [1, 0] },
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) return checkTruthTable(tableData, 'Some rows are incorrect. PushOff blocks signal while pressed.')
        const schemaResult = checkSchemaAgainstReferences(schema, REF_DC_PUSHOFF_LED)
        if (!schemaResult.correct) return schemaResult
        return checkTruthTable(tableData, 'Some rows are incorrect. PushOff blocks signal while pressed.')
        return { correct: true }
      },
    },

    // ─── Task 4: Toggle ───
    {
      id: 'toggle',
      title: 'Toggle Switch',
      subtitle: 'Latching switch',
      description: 'A Toggle switch works like a light switch — click it once to turn on, click again to turn off. Connect DC → Toggle → LED and try it out. Complete the truth table to verify the behavior.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'tog', x: 128, y: SIM_H / 2 - 16, label: 'Toggle' },
          { type: 'LED', id: 'led', x: 300, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: { inputLabels: ['Toggle'], outputLabels: ['LED'], numInputs: 1, expected: [0, 1] },
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) return checkTruthTable(tableData, 'Some rows are incorrect. Toggle passes signal when on.')
        const schemaResult = checkSchemaAgainstReferences(schema, REF_DC_TOGGLE_LED)
        if (!schemaResult.correct) return schemaResult
        return checkTruthTable(tableData, 'Some rows are incorrect. Toggle passes signal when on.')
        return { correct: true }
      },
    },

    // ─── Task 5: Buffer ───
    {
      id: 'buffer',
      title: 'Buffer Gate',
      subtitle: 'Signal follower',
      description: 'A Buffer (BUF) passes the input signal to the output unchanged. Connect DC → Toggle → BUF → LED. The LED follows the toggle state.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'tog', x: 96, y: SIM_H / 2 - 16, label: 'Toggle' },
          { type: 'BUF', id: 'buf', x: 176, y: SIM_H / 2 - 16, label: 'BUF' },
          { type: 'LED', id: 'led', x: 284, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) {
          const ledIn = signals.find(s => s.deviceId === resolve('LED') && s.type === 'in')
          if (ledIn && ledIn.value != null) return { correct: true }
          return { correct: false, hint: 'Connect DC → Toggle → BUF → LED. The LED should turn on when you toggle the switch.' }
        }
        return checkSchemaAgainstReferences(schema, REF_DC_TOGGLE_BUF_LED)
      },
    },

    // ─── Task 6: NOT ───
    {
      id: 'not',
      title: 'NOT Gate',
      subtitle: 'The inverter',
      description: 'The NOT gate flips the signal. If input is ON, output is OFF. If input is OFF, output is ON. Toggle the switch and observe. Then complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'tog', x: 96, y: SIM_H / 2 - 16, label: 'A' },
          { type: 'NOT', id: 'gate', x: 176, y: SIM_H / 2 - 16, label: 'NOT' },
          { type: 'LED', id: 'led', x: 284, y: SIM_H / 2 - 16, label: 'OUT' },
        ],
        connectors: [
          { from: 'tog.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'tog.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A'], outputLabels: ['OUT'], numInputs: 1, expected: [1, 0] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. NOT should invert the input.')
        return { correct: true }
      },
    },

    // ─── Task 8: Build a NOT Gate ───
    {
      id: 'build-not',
      title: 'Build a NOT Gate',
      subtitle: 'Invert from scratch',
      description: 'Build the NOT gate circuit from scratch. Drag a DC source, a Toggle switch, a NOT gate, and an LED from the toolbox. Wire them: DC → Toggle → NOT → LED. Then toggle the switch and complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'DC', maxCount: 1 },
          { type: 'Toggle', maxCount: 1, labelMask: 'A' },
          { type: 'NOT', maxCount: 1 },
          { type: 'LED', maxCount: 1, labelMask: 'OUT' },
        ],
        devices: [],
        connectors: [],
      },
      tableConfig: { inputLabels: ['A'], outputLabels: ['OUT'], numInputs: 1, expected: [1, 0] },
      checkSolution(signals, buttons, tableData, resolve, schema) {
        if (!schema) return checkTruthTable(tableData, 'Some rows are incorrect. NOT should invert the input.')
        const schemaResult = checkSchemaAgainstReferences(schema, REF_BUILD_NOT)
        if (!schemaResult.correct) return schemaResult
        return checkTruthTable(tableData, 'Some rows are incorrect. NOT should invert the input.')
        return { correct: true }
      },
    },

    // ─── Task 9: AND ───
    {
      id: 'and',
      title: 'AND Gate',
      subtitle: 'Both must be true',
      description: 'The AND gate outputs ON only when ALL inputs are ON. Toggle the two switches and observe the output. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'AND', id: 'gate', x: 192, y: 60, label: 'AND' },
          { type: 'LED', id: 'led', x: 300, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'ta.out0' },
          { from: 'gate.in1', to: 'tb.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [0, 0, 0, 1] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. AND outputs 1 only when both inputs are 1.')
        return { correct: true }
      },
    },

    // ─── Task 8: NAND ───
    {
      id: 'nand',
      title: 'NAND Gate',
      subtitle: 'NOT AND',
      description: 'The NAND gate is the opposite of AND. It outputs ON unless ALL inputs are ON. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'NAND', id: 'gate', x: 192, y: 60, label: 'NAND' },
          { type: 'LED', id: 'led', x: 300, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'ta.out0' },
          { from: 'gate.in1', to: 'tb.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [1, 1, 1, 0] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. NAND outputs 0 only when both inputs are 1.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 9: OR ───
    {
      id: 'or',
      title: 'OR Gate',
      subtitle: 'At least one must be true',
      description: 'The OR gate outputs ON when AT LEAST ONE input is ON. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'OR', id: 'gate', x: 192, y: 60, label: 'OR' },
          { type: 'LED', id: 'led', x: 300, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'ta.out0' },
          { from: 'gate.in1', to: 'tb.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [0, 1, 1, 1] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. OR outputs 0 only when both inputs are 0.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 10: NOR ───
    {
      id: 'nor',
      title: 'NOR Gate',
      subtitle: 'NOT OR',
      description: 'The NOR gate is the opposite of OR. It outputs ON only when ALL inputs are OFF. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'NOR', id: 'gate', x: 192, y: 60, label: 'NOR' },
          { type: 'LED', id: 'led', x: 300, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'ta.out0' },
          { from: 'gate.in1', to: 'tb.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [1, 0, 0, 0] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. NOR outputs 1 only when both inputs are 0.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 11: XOR ───
    {
      id: 'xor',
      title: 'XOR Gate',
      subtitle: 'Exclusive OR',
      description: 'The XOR gate outputs ON when the inputs are DIFFERENT. One is ON, the other OFF — but not both. It is a "difference detector". Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'XOR', id: 'gate', x: 192, y: 60, label: 'XOR' },
          { type: 'LED', id: 'led', x: 300, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'ta.out0' },
          { from: 'gate.in1', to: 'tb.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [0, 1, 1, 0] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. XOR outputs 1 when inputs differ.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12: XNOR ───
    {
      id: 'xnor',
      title: 'XNOR Gate',
      subtitle: 'Exclusive NOR',
      description: 'The XNOR gate outputs ON when the inputs are the SAME. Both ON or both OFF. It is an "equality detector". Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'XNOR', id: 'gate', x: 192, y: 60, label: 'XNOR' },
          { type: 'LED', id: 'led', x: 300, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'gate.in0', to: 'ta.out0' },
          { from: 'gate.in1', to: 'tb.out0' },
          { from: 'led.in0', to: 'gate.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [1, 0, 0, 1] },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'Some rows are incorrect. XNOR outputs 1 when inputs are equal.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12a: Make a NOT Gate from a NAND Gate ───
    {
      id: 'build-not-from-nand',
      title: 'Make NOT Gate from NAND',
      subtitle: 'NAND as inverter',
      description: 'A NAND gate becomes an inverter when both of its inputs are tied together. Add one NAND gate from the toolbox, connect both of its inputs to the A toggle, and feed its output to the OUT LED. Then toggle A and complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'NAND', maxCount: 1 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'LED', id: 'led', x: 320, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A'], outputLabels: ['OUT'], numInputs: 1, expected: [1, 0], showReference: true },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'The circuit is not a NOT gate. Tie both NAND inputs to the A toggle so the NAND acts as an inverter.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12b: Make a NAND Gate from AND and NOT Gates ───
    {
      id: 'build-nand-from-and-not',
      title: 'Make NAND from AND and NOT',
      subtitle: 'Invert an AND',
      description: 'Combine an AND gate with a NOT gate to build a NAND gate: the NOT gate inverts the AND output. Wire A and B into the AND, then run the AND output through the NOT into OUT. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'AND', maxCount: 1 },
          { type: 'NOT', maxCount: 1 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'LED', id: 'led', x: 320, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [1, 1, 1, 0], showReference: true },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'The circuit is not a NAND. Send A and B into an AND gate, then invert its output with a NOT gate.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12c: Make an AND Gate for Three Inputs ───
    {
      id: 'build-and3',
      title: 'Make AND Gate for Three Inputs',
      subtitle: 'Only 2-input AND gates',
      description: 'Build an AND gate with three inputs A, B and C using only 2-input AND gates. AND A and B together, then AND that result with C. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'AND', maxCount: 2 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'Toggle', id: 'tc', x: 96, y: 152, label: 'C' },
          { type: 'LED', id: 'led', x: 320, y: 96, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'tc.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B', 'C'], outputLabels: ['OUT'], numInputs: 3, expected: [0, 0, 0, 0, 0, 0, 0, 1], showReference: true },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'The output should be 1 only when A, B and C are all ON. Chain two AND gates: (A·B)·C.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12d: Make an OR Gate for Three Inputs ───
    {
      id: 'build-or3',
      title: 'Make OR Gate for Three Inputs',
      subtitle: 'Only 2-input OR gates',
      description: 'Build an OR gate with three inputs A, B and C using only 2-input OR gates. OR A and B together, then OR that result with C. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'OR', maxCount: 2 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'Toggle', id: 'tc', x: 96, y: 152, label: 'C' },
          { type: 'LED', id: 'led', x: 320, y: 96, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'tc.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B', 'C'], outputLabels: ['OUT'], numInputs: 3, expected: [0, 1, 1, 1, 1, 1, 1, 1], showReference: true },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'The output should be 1 when at least one of A, B or C is ON. Chain two OR gates: (A+B)+C.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12e: Make an AND Gate from only NAND Gates ───
    {
      id: 'build-and-from-nand',
      title: 'Make AND Gate from NAND',
      subtitle: 'Only NAND gates',
      description: 'A NAND output flipped by a second NAND becomes AND. Use one NAND for the logic and a second NAND as an inverter (tie both of its inputs to the first NAND output). Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'NAND', maxCount: 2 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'LED', id: 'led', x: 320, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [0, 0, 0, 1], showReference: true },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'NAND plus an inverter restores AND. Invert the NAND output with a second NAND (inputs tied together).', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12f: Make an OR Gate from only NAND Gates ───
    {
      id: 'build-or-from-nand',
      title: 'Make OR Gate from NAND',
      subtitle: 'Only NAND gates',
      description: 'By the De Morgan rule, NOT(NOT A · NOT B) = A + B. Use a NAND with tied inputs as an inverter for each input, then feed both inverted signals into a third NAND. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'NAND', maxCount: 3 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'LED', id: 'led', x: 320, y: 60, label: 'OUT' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: { inputLabels: ['A', 'B'], outputLabels: ['OUT'], numInputs: 2, expected: [0, 1, 1, 1], showReference: true },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'For OR, invert each input first with a NAND (inputs tied), then combine the two inverted signals in a third NAND.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12g: Build a Half-Summator ───
    {
      id: 'build-half-adder',
      title: 'Build a Half-Summator',
      subtitle: 'Sum and carry',
      description: 'A half-summator (half adder) adds two bits A and B. The SUM output equals XOR(A,B); the CARRY output equals AND(A,B). Build it with one XOR gate and one AND gate. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'XOR', maxCount: 1 },
          { type: 'AND', maxCount: 1 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'LED', id: 'ledSum', x: 320, y: 30, label: 'SUM' },
          { type: 'LED', id: 'ledCarry', x: 320, y: 110, label: 'CARRY' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: {
        inputLabels: ['A', 'B'], outputLabels: ['SUM', 'CARRY'], numInputs: 2,
        expected: [[0, 0], [1, 0], [1, 0], [0, 1]], showReference: true,
      },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'SUM must be 1 when the inputs differ (XOR); CARRY must be 1 only when both inputs are 1 (AND).', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 12h: Build a Summator ───
    {
      id: 'build-summator',
      title: 'Build a Summator',
      subtitle: 'Full adder',
      description: 'A summator (full adder) adds two bits A and B together with a carry-in C. The SUM output equals XOR(A,B,C); the CARRY output is 1 when at least two of the three inputs are 1. Build it with two XOR gates, two AND gates and one OR gate. Complete the truth table.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'XOR', maxCount: 2 },
          { type: 'AND', maxCount: 2 },
          { type: 'OR', maxCount: 1 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'ta', x: 96, y: 40, label: 'A' },
          { type: 'Toggle', id: 'tb', x: 96, y: 96, label: 'B' },
          { type: 'Toggle', id: 'tc', x: 96, y: 152, label: 'C' },
          { type: 'LED', id: 'ledSum', x: 320, y: 30, label: 'SUM' },
          { type: 'LED', id: 'ledCarry', x: 320, y: 110, label: 'CARRY' },
        ],
        connectors: [
          { from: 'ta.in0', to: 'dc.out0' },
          { from: 'tb.in0', to: 'dc.out0' },
          { from: 'tc.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: {
        inputLabels: ['A', 'B', 'C'], outputLabels: ['SUM', 'CARRY'], numInputs: 3,
        expected: [[0, 0], [1, 0], [1, 0], [0, 1], [1, 0], [0, 1], [0, 1], [1, 1]], showReference: true,
      },
      checkSolution(signals, buttons, tableData, resolve) {
        return checkTruthTable(tableData, 'SUM must be 1 when an odd number of the three inputs is 1 (XOR). CARRY must be 1 when at least two of the three inputs are 1.', 'Fill all rows.')
        return { correct: true }
      },
    },

    // ─── Task 13: Investigate RS Trigger ───
    {
      id: 'investigate-rs-trigger',
      title: 'Investigate RS Trigger',
      subtitle: 'Watch it in action',
      description: 'This RS (Reset-Set) trigger is already built from two cross-coupled NAND gates. Press the ~S (Set) button to set Q=1, press ~R (Reset) to reset Q=0. Observe how the two NAND gates hold the last state — the memory effect. Q and ~Q are always opposite.',
      simulation: {
        width: 700, height: 280,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'PushOff', id: 'pbS', x: 112, y: 36, label: '~S' },
          { type: 'PushOff', id: 'pbR', x: 112, y: 180, label: '~R' },
          { type: 'NAND', id: 'na', x: 240, y: 56, label: 'NAND' },
          { type: 'NAND', id: 'nb', x: 240, y: 150, label: 'NAND' },
          { type: 'LED', id: 'ledQ', x: 430, y: 60, label: 'Q' },
          { type: 'LED', id: 'ledNQ', x: 430, y: 150, label: '~Q' },
        ],
        connectors: [
          { from: 'pbS.in0', to: 'dc.out0' },
          { from: 'pbR.in0', to: 'dc.out0' },
          { from: 'na.in0', to: 'pbS.out0' },
          { from: 'na.in1', to: 'nb.out0' },
          { from: 'nb.in0', to: 'pbR.out0' },
          { from: 'nb.in1', to: 'na.out0' },
          { from: 'ledQ.in0', to: 'na.out0' },
          { from: 'ledNQ.in0', to: 'nb.out0' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        return checkTriggerLit(signals, resolve, ['Q', '~Q'],
          'Press the ~S or ~R buttons to change the state. One of the Q or ~Q LEDs should stay lit.')
      },
    },

    // ─── Task 14: Build RS Trigger ───
    {
      id: 'rs-trigger',
      title: 'Build RS Trigger',
      subtitle: 'From NAND gates',
      description: 'An RS (Reset-Set) trigger is a simple memory element built from two cross-coupled NAND gates. Add two NAND gates from the toolbox and connect them: output of each NAND to input of the other. The ~S (Set) input sets Q=1, ~R (Reset) input resets Q=0. Complete the state table.',
      simulation: {
        width: 700, height: 280,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'NAND', maxCount: 2 },
          { type: 'LED', maxCount: 1, labelMask: 'Q' },
          { type: 'LED', maxCount: 1, labelMask: '~Q' },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'PushOff', id: 'pbS', x: 112, y: 36, label: '~S' },
          { type: 'PushOff', id: 'pbR', x: 112, y: 180, label: '~R' },
        ],
        connectors: [
          { from: 'pbS.in0', to: 'dc.out0' },
          { from: 'pbR.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        const legacyCheck = () => {
          const qSig = signals.find(s => s.deviceId === resolve('Q') && s.type === 'in')
          const nqSig = signals.find(s => s.deviceId === resolve('~Q') && s.type === 'in')
          const hasQ = qSig && qSig.value != null
          const hasNQ = nqSig && nqSig.value != null
          if (hasQ && hasNQ) return { correct: true }
          if (hasQ) return { correct: false, hint: 'Q is working, but ~Q (inverted output) is not connected. Make sure both NANDs are cross-connected.' }
          return { correct: false, hint: 'Add two NAND gates. Connect each NAND output to the other NAND input. Connect ~S to one NAND and ~R to the other. Wire outputs to Q and ~Q LEDs.' }
        }
        if (!schema) return legacyCheck()
        const schemaResult = checkSchemaAgainstReferences(schema, REF_RS_TRIGGER)
        return schemaResult.correct ? schemaResult : legacyCheck()
      },
    },

    // ─── Task 15: Investigate JK Trigger ───
    {
      id: 'investigate-jk-trigger',
      title: 'Investigate JK Trigger',
      subtitle: 'Watch it in action',
      description: 'This JK trigger is already built. It uses an RS-FF plus two NAND gates. Set J or K with the toggles, then press CLK to sample them: J sets Q=1, K resets Q=0. When both J and K are ON, Q toggles on each clock pulse. Observe how Q and ~Q change.',
      simulation: {
        width: 700, height: 300,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: 130, label: 'DC' },
          { type: 'Toggle', id: 'togJ', x: 96, y: 48, label: 'J' },
          { type: 'PushOn', id: 'pbClk', x: 96, y: 120, label: 'CLK' },
          { type: 'Toggle', id: 'togK', x: 96, y: 192, label: 'K' },
          { type: 'NAND', id: 'nandJ', x: 200, y: 56, label: 'NAND' },
          { type: 'NAND', id: 'nandK', x: 200, y: 160, label: 'NAND' },
          { type: 'RS-FF', id: 'rs', x: 360, y: 100, label: 'RS-FF' },
          { type: 'LED', id: 'ledQ', x: 560, y: 60, label: 'Q' },
          { type: 'LED', id: 'ledNQ', x: 560, y: 180, label: '~Q' },
        ],
        connectors: [
          { from: 'togJ.in0', to: 'dc.out0' },
          { from: 'pbClk.in0', to: 'dc.out0' },
          { from: 'togK.in0', to: 'dc.out0' },
          { from: 'nandJ.in0', to: 'togJ.out0' },
          { from: 'nandJ.in1', to: 'pbClk.out0' },
          { from: 'rs.in0', to: 'nandJ.out0' },
          { from: 'nandK.in0', to: 'togK.out0' },
          { from: 'nandK.in1', to: 'pbClk.out0' },
          { from: 'rs.in1', to: 'nandK.out0' },
          { from: 'ledQ.in0', to: 'rs.out0' },
          { from: 'ledNQ.in0', to: 'rs.out1' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        return checkTriggerLit(signals, resolve, ['Q', '~Q'],
          'Set J or K, then press CLK to apply the input. One of the Q or ~Q LEDs should stay lit.')
      },
    },

    // ─── Task 16: Build JK Trigger ───
    {
      id: 'jk-trigger',
      title: 'Build JK Trigger',
      subtitle: 'Using RS-FF',
      description: 'A JK trigger builds on the RS-FF by adding clocked inputs. It uses an RS-FF plus additional NAND gates and a NOT gate. The J and K inputs are sampled on the clock edge. Complete the state table.',
      simulation: {
        width: 700, height: 300,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'RS-FF', maxCount: 1 },
          { type: 'NAND', maxCount: 3 },
          { type: 'NOT', maxCount: 1 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: 130, label: 'DC' },
          { type: 'Toggle', id: 'togJ', x: 96, y: 48, label: 'J' },
          { type: 'PushOn', id: 'pbClk', x: 96, y: 120, label: 'CLK' },
          { type: 'Toggle', id: 'togK', x: 96, y: 192, label: 'K' },
          { type: 'LED', id: 'ledQ', x: 620, y: 60, label: 'Q' },
          { type: 'LED', id: 'ledNQ', x: 620, y: 180, label: '~Q' },
        ],
        connectors: [
          { from: 'togJ.in0', to: 'dc.out0' },
          { from: 'pbClk.in0', to: 'dc.out0' },
          { from: 'togK.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        const legacyCheck = () => {
          const qSig = signals.find(s => s.deviceId === resolve('Q') && s.type === 'in')
          const nqSig = signals.find(s => s.deviceId === resolve('~Q') && s.type === 'in')
          const hasQ = qSig && qSig.value != null
          const hasNQ = nqSig && nqSig.value != null
          if (hasQ && hasNQ) return { correct: true }
          if (hasQ) return { correct: false, hint: 'Q works, but ~Q LED is not lit. Make sure both outputs are connected.' }
          return { correct: false, hint: 'Build the JK trigger: RS-FF + 3 NANDs + NOT. Connect J, CLK, K inputs, and wire Q and ~Q outputs.' }
        }
        if (!schema) return legacyCheck()
        const schemaResult = checkSchemaAgainstReferences(schema, REF_JK_TRIGGER)
        return schemaResult.correct ? schemaResult : legacyCheck()
      },
    },

    // ─── Task 17: Investigate D Trigger ───
    {
      id: 'investigate-d-trigger',
      title: 'Investigate D Trigger',
      subtitle: 'Watch it in action',
      description: 'This D (Data) trigger is already built. Set D with the toggle, then press CLK: Q copies the value of D. If you press CLK again without changing D, Q stays the same. This is how memory captures and holds a data value.',
      simulation: {
        width: 700, height: 260,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: 110, label: 'DC' },
          { type: 'Toggle', id: 'togD', x: 96, y: 40, label: 'D' },
          { type: 'PushOn', id: 'pbClk', x: 96, y: 120, label: 'CLK' },
          { type: 'NOT', id: 'not', x: 200, y: 56, label: 'NOT' },
          { type: 'NAND', id: 'nandS', x: 280, y: 70, label: 'NAND' },
          { type: 'NAND', id: 'nandR', x: 280, y: 160, label: 'NAND' },
          { type: 'RS-FF', id: 'rs', x: 420, y: 100, label: 'RS-FF' },
          { type: 'LED', id: 'ledQ', x: 560, y: 60, label: 'Q' },
          { type: 'LED', id: 'ledNQ', x: 560, y: 150, label: '~Q' },
        ],
        connectors: [
          { from: 'togD.in0', to: 'dc.out0' },
          { from: 'pbClk.in0', to: 'dc.out0' },
          { from: 'not.in0', to: 'togD.out0' },
          { from: 'nandS.in0', to: 'togD.out0' },
          { from: 'nandS.in1', to: 'pbClk.out0' },
          { from: 'rs.in0', to: 'nandS.out0' },
          { from: 'nandR.in0', to: 'pbClk.out0' },
          { from: 'nandR.in1', to: 'not.out0' },
          { from: 'rs.in1', to: 'nandR.out0' },
          { from: 'ledQ.in0', to: 'rs.out0' },
          { from: 'ledNQ.in0', to: 'rs.out1' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        return checkTriggerLit(signals, resolve, ['Q', '~Q'],
          'Set D, then press CLK to copy the value. One of the Q or ~Q LEDs should stay lit.')
      },
    },

    // ─── Task 18: Build D Trigger ───
    {
      id: 'd-trigger',
      title: 'Build D Trigger',
      subtitle: 'Using RS-FF',
      description: 'A D (Data) trigger captures the input value on the clock edge. Build it using an RS-FF plus two NANDs and a NOT gate. Complete the state table.',
      simulation: {
        width: 700, height: 260,
        showToolbox: true,
        canAdd: true, canRemove: true, canMove: true,
        canRewire: true, canEdit: false,
        toolbox: [
          { type: 'RS-FF', maxCount: 1 },
          { type: 'NAND', maxCount: 2 },
          { type: 'NOT', maxCount: 1 },
        ],
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: 110, label: 'DC' },
          { type: 'Toggle', id: 'togD', x: 96, y: 40, label: 'D' },
          { type: 'PushOn', id: 'pbClk', x: 96, y: 120, label: 'CLK' },
          { type: 'LED', id: 'ledQ', x: 620, y: 50, label: 'Q' },
          { type: 'LED', id: 'ledNQ', x: 620, y: 150, label: '~Q' },
        ],
        connectors: [
          { from: 'togD.in0', to: 'dc.out0' },
          { from: 'pbClk.in0', to: 'dc.out0' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve, schema) {
        const legacyCheck = () => {
          const qSig = signals.find(s => s.deviceId === resolve('Q') && s.type === 'in')
          const nqSig = signals.find(s => s.deviceId === resolve('~Q') && s.type === 'in')
          const hasQ = qSig && qSig.value != null
          const hasNQ = nqSig && nqSig.value != null
          if (hasQ && hasNQ) return { correct: true }
          if (hasQ) return { correct: false, hint: 'Q works, but ~Q LED is not lit.' }
          return { correct: false, hint: 'Build the D trigger: RS-FF + 2 NANDs + NOT. Connect D and CLK inputs, wire Q and ~Q to LEDs.' }
        }
        if (!schema) return legacyCheck()
        const schemaResult = checkSchemaAgainstReferences(schema, REF_D_TRIGGER)
        return schemaResult.correct ? schemaResult : legacyCheck()
      },
    },

    // ─── Task 19: Counter ───
    {
      id: 'counter',
      title: '8-Bit Counter',
      subtitle: 'Counting in binary',
      description: 'This circuit uses the 8-bit counter component. Press CLK (PushOn) repeatedly to increment the counter. The 8 LEDs show the value in binary. Try toggling the T (enable) input — when T=0 the counter stops counting. Observe how binary counting works.',
      simulation: {
        width: 700, height: 260,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: true,
        canRewire: false, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: 120, label: 'DC' },
          { type: 'Toggle', id: 'togT', x: 88, y: 60, label: 'T' },
          { type: 'PushOn', id: 'pbClk', x: 88, y: 140, label: 'CLK' },
          { type: '8bitCounter', id: 'cnt', x: 200, y: 30, label: '8bitCounter' },
          { type: 'LED', id: 'd0', x: 520, y: 26, label: 'D0' },
          { type: 'LED', id: 'd1', x: 520, y: 54, label: 'D1' },
          { type: 'LED', id: 'd2', x: 520, y: 82, label: 'D2' },
          { type: 'LED', id: 'd3', x: 520, y: 110, label: 'D3' },
          { type: 'LED', id: 'd4', x: 520, y: 138, label: 'D4' },
          { type: 'LED', id: 'd5', x: 520, y: 166, label: 'D5' },
          { type: 'LED', id: 'd6', x: 520, y: 194, label: 'D6' },
          { type: 'LED', id: 'd7', x: 520, y: 222, label: 'D7' },
        ],
        connectors: [
          { from: 'togT.in0', to: 'dc.out0' },
          { from: 'pbClk.in0', to: 'dc.out0' },
          { from: 'cnt.in0', to: 'togT.out0' },
          { from: 'cnt.in1', to: 'pbClk.out0' },
          { from: 'd0.in0', to: 'cnt.out0' },
          { from: 'd1.in0', to: 'cnt.out1' },
          { from: 'd2.in0', to: 'cnt.out2' },
          { from: 'd3.in0', to: 'cnt.out3' },
          { from: 'd4.in0', to: 'cnt.out4' },
          { from: 'd5.in0', to: 'cnt.out5' },
          { from: 'd6.in0', to: 'cnt.out6' },
          { from: 'd7.in0', to: 'cnt.out7' },
        ],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve) {
        const ledLabels = ['D0','D1','D2','D3','D4','D5','D6','D7']
        const allLit = ledLabels.some(label => {
          const s = signals.find(sig => sig.deviceId === resolve(label) && sig.type === 'in')
          return s && s.value != null
        })
        if (allLit) return { correct: true }
        const anyLit = ledLabels.some(label => {
          const s = signals.find(sig => sig.deviceId === resolve(label) && sig.type === 'in')
          return s && s.value != null
        })
        if (anyLit) return { correct: true }
        return { correct: false, hint: 'Press CLK (PushOn button) to start counting. Make sure T toggle is ON. You should see LEDs light up in binary pattern.' }
      },
    },
  ],
}
