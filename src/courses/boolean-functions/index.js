import { GATES } from './gates.js'

export const BOOLEAN_COURSE = {
  id: 'boolean-functions',
  title: 'Basic Boolean Functions',
  description: 'Learn how logic gates work! Flip the switches, watch the outputs, and discover the building blocks of computers.',
  icon: '🔌',
  parameters: {
    'gate-standard': {
      label: 'Gate Drawing Standard',
      type: 'select',
      defaultValue: 'ansi',
      options: [
        { value: 'ansi', label: 'ANSI / IEEE Std 91/91a' },
        { value: 'iec', label: 'IEC 60617-12' },
      ],
    },
  },
  pages: [
    {
      id: 'not',
      title: 'NOT Gate',
      subtitle: 'The Inverter',
      description: 'The NOT gate flips the signal. If input is ON, output is OFF. If input is OFF, output is ON. It is called an inverter.',
      gateType: 'not',
      inputs: 1,
    },
    {
      id: 'and',
      title: 'AND Gate',
      subtitle: 'Both must be true',
      description: 'The AND gate outputs ON only when ALL inputs are ON. Think of it as two switches in series — both must be closed for the light to turn on.',
      gateType: 'and',
      inputs: 2,
    },
    {
      id: 'or',
      title: 'OR Gate',
      subtitle: 'At least one must be true',
      description: 'The OR gate outputs ON when AT LEAST ONE input is ON. Like two switches in parallel — flip any one and the light turns on.',
      gateType: 'or',
      inputs: 2,
    },
    {
      id: 'nand',
      title: 'NAND Gate',
      subtitle: 'NOT AND',
      description: 'The NAND gate is the opposite of AND. It outputs ON unless ALL inputs are ON. It is an AND gate followed by a NOT.',
      gateType: 'nand',
      inputs: 2,
    },
    {
      id: 'nor',
      title: 'NOR Gate',
      subtitle: 'NOT OR',
      description: 'The NOR gate is the opposite of OR. It outputs ON only when ALL inputs are OFF. It is an OR gate followed by a NOT.',
      gateType: 'nor',
      inputs: 2,
    },
    {
      id: 'xor',
      title: 'XOR Gate',
      subtitle: 'Exclusive OR',
      description: 'The XOR gate outputs ON when the inputs are DIFFERENT. One is ON, the other OFF — but not both. It is like a "difference detector".',
      gateType: 'xor',
      inputs: 2,
    },
    {
      id: 'xnor',
      title: 'XNOR Gate',
      subtitle: 'Exclusive NOR',
      description: 'The XNOR gate outputs ON when the inputs are the SAME. Both ON or both OFF. It is a "equality detector".',
      gateType: 'xnor',
      inputs: 2,
    },
  ],
}

export function computeGate(gateType, inputs) {
  const gate = Object.values(GATES).find(g => g.id === gateType)
  if (!gate) return 0
  return gate.fn(...inputs)
}

export function getGateDef(gateType) {
  return Object.values(GATES).find(g => g.id === gateType)
}
