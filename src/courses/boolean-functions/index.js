const SIM_W = 600
const SIM_H = 260

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
      description: 'On the scheme below you see a DC source (power supply) on the left and an LED on the right. Your task is to connect the DC output to the LED input. Click on a connector point (small circle) on the DC output, then click on the connector point on the LED input — a wire will appear.',
      simulation: {
        width: SIM_W, height: SIM_H,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: false,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'LED', id: 'led', x: SIM_W - 96, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: null,
      checkSolution(signals, buttons, tableData, resolve) {
        const dcOut = signals.find(s => s.deviceId === resolve('DC') && s.type === 'out')
        const ledIn = signals.find(s => s.deviceId === resolve('LED') && s.type === 'in')
        if (!dcOut || !ledIn) return { correct: false, hint: 'Could not read signals.' }
        if (ledIn.value != null) return { correct: true }
        return { correct: false, hint: 'The LED is not lit. Make sure you connected the DC output to the LED input.' }
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
      checkSolution(signals, buttons, tableData, resolve) {
        const dcOut = signals.find(s => s.deviceId === resolve('DC') && s.type === 'out')
        const ledIn = signals.find(s => s.deviceId === resolve('LED') && s.type === 'in')
        if (!dcOut || !ledIn) return { correct: false, hint: 'Add a DC source and an LED to the field.' }
        if (ledIn.value != null) return { correct: true }
        return { correct: false, hint: 'Connect DC output to LED input.' }
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
        canAdd: false, canRemove: false, canMove: false,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'PushOn', id: 'btn', x: 128, y: SIM_H / 2 - 16, label: 'PushOn' },
          { type: 'LED', id: 'led', x: 300, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: { inputLabels: ['PushOn'], outputLabels: ['LED'], numInputs: 1, expected: [0, 1] },
      checkSolution(signals, buttons, tableData, resolve) {
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. PushOn passes signal only while pressed.' }
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
      checkSolution(signals, buttons, tableData, resolve) {
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. PushOn passes signal only while pressed.' }
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
        canAdd: false, canRemove: false, canMove: false,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'PushOff', id: 'btn', x: 128, y: SIM_H / 2 - 16, label: 'PushOff' },
          { type: 'LED', id: 'led', x: 300, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: { inputLabels: ['PushOff'], outputLabels: ['LED'], numInputs: 1, expected: [1, 0] },
      checkSolution(signals, buttons, tableData, resolve) {
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. PushOff blocks signal while pressed.' }
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
        canAdd: false, canRemove: false, canMove: false,
        canRewire: true, canEdit: false,
        devices: [
          { type: 'DC', id: 'dc', x: 32, y: SIM_H / 2 - 16, label: 'DC' },
          { type: 'Toggle', id: 'tog', x: 128, y: SIM_H / 2 - 16, label: 'Toggle' },
          { type: 'LED', id: 'led', x: 300, y: SIM_H / 2 - 16, label: 'LED' },
        ],
        connectors: [],
      },
      tableConfig: { inputLabels: ['Toggle'], outputLabels: ['LED'], numInputs: 1, expected: [0, 1] },
      checkSolution(signals, buttons, tableData, resolve) {
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. Toggle passes signal when on.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
      checkSolution(signals, buttons, tableData, resolve) {
        const ledIn = signals.find(s => s.deviceId === resolve('LED') && s.type === 'in')
        if (ledIn && ledIn.value != null) return { correct: true }
        return { correct: false, hint: 'Connect DC → Toggle → BUF → LED. The LED should turn on when you toggle the switch.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. NOT should invert the input.' }
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
      checkSolution(signals, buttons, tableData, resolve) {
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. NOT should invert the input.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows of the truth table.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. AND outputs 1 only when both inputs are 1.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. NAND outputs 0 only when both inputs are 1.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. OR outputs 0 only when both inputs are 0.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. NOR outputs 1 only when both inputs are 0.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. XOR outputs 1 when inputs differ.' }
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
        canAdd: false, canRemove: false, canMove: false,
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
        if (!tableData) return { correct: false, hint: 'Complete the truth table.' }
        if (!tableData.isComplete()) return { correct: false, hint: 'Fill all rows.' }
        if (!tableData.isCorrect()) return { correct: false, hint: 'Some rows are incorrect. XNOR outputs 1 when inputs are equal.' }
        return { correct: true }
      },
    },

    // ─── Task 13: RS Trigger ───
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
      checkSolution(signals, buttons, tableData, resolve) {
        const qSig = signals.find(s => s.deviceId === resolve('Q') && s.type === 'in')
        const nqSig = signals.find(s => s.deviceId === resolve('~Q') && s.type === 'in')
        const hasQ = qSig && qSig.value != null
        const hasNQ = nqSig && nqSig.value != null
        if (hasQ && hasNQ) return { correct: true }
        if (hasQ) return { correct: false, hint: 'Q is working, but ~Q (inverted output) is not connected. Make sure both NANDs are cross-connected.' }
        return { correct: false, hint: 'Add two NAND gates. Connect each NAND output to the other NAND input. Connect ~S to one NAND and ~R to the other. Wire outputs to Q and ~Q LEDs.' }
      },
    },

    // ─── Task 14: JK Trigger ───
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
      checkSolution(signals, buttons, tableData, resolve) {
        const qSig = signals.find(s => s.deviceId === resolve('Q') && s.type === 'in')
        const nqSig = signals.find(s => s.deviceId === resolve('~Q') && s.type === 'in')
        const hasQ = qSig && qSig.value != null
        const hasNQ = nqSig && nqSig.value != null
        if (hasQ && hasNQ) return { correct: true }
        if (hasQ) return { correct: false, hint: 'Q works, but ~Q LED is not lit. Make sure both outputs are connected.' }
        return { correct: false, hint: 'Build the JK trigger: RS-FF + 3 NANDs + NOT. Connect J, CLK, K inputs, and wire Q and ~Q outputs.' }
      },
    },

    // ─── Task 15: D Trigger ───
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
      checkSolution(signals, buttons, tableData, resolve) {
        const qSig = signals.find(s => s.deviceId === resolve('Q') && s.type === 'in')
        const nqSig = signals.find(s => s.deviceId === resolve('~Q') && s.type === 'in')
        const hasQ = qSig && qSig.value != null
        const hasNQ = nqSig && nqSig.value != null
        if (hasQ && hasNQ) return { correct: true }
        if (hasQ) return { correct: false, hint: 'Q works, but ~Q LED is not lit.' }
        return { correct: false, hint: 'Build the D trigger: RS-FF + 2 NANDs + NOT. Connect D and CLK inputs, wire Q and ~Q to LEDs.' }
      },
    },

    // ─── Task 16: Counter ───
    {
      id: 'counter',
      title: '8-Bit Counter',
      subtitle: 'Counting in binary',
      description: 'This circuit uses the 8-bit counter component. Press CLK (PushOn) repeatedly to increment the counter. The 8 LEDs show the value in binary. Try toggling the T (enable) input — when T=0 the counter stops counting. Observe how binary counting works.',
      simulation: {
        width: 700, height: 260,
        showToolbox: false,
        canAdd: false, canRemove: false, canMove: false,
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
