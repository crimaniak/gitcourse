export function createTableData(inputLabels, outputLabels) {
  const numInputs = inputLabels.length
  const rows = 1 << numInputs
  const data = []
  for (let i = 0; i < rows; i++) {
    const inputs = []
    for (let j = 0; j < numInputs; j++) {
      inputs.push((i >> (numInputs - 1 - j)) & 1)
    }
    data.push({ inputs, outputs: outputLabels.map(() => '–'), filled: false })
  }
  return data
}

export function getInputCombination(signals, inputDeviceIds) {
  return inputDeviceIds.map(id => {
    const signal = signals.find(s => s.deviceId === id && s.type === 'out')
    return signal && signal.value != null ? signal.value : 0
  })
}

export function getOutputValues(signals, outputDeviceIds) {
  return outputDeviceIds.map(id => {
    const signal = signals.find(s => s.deviceId === id && s.type === 'in')
    return signal && signal.value != null ? signal.value : 0
  })
}

export function updateTableRow(tableData, inputs, outputs) {
  const numInputs = inputs.length
  let rowIndex = 0
  for (let i = 0; i < numInputs; i++) {
    rowIndex = (rowIndex << 1) | (inputs[i] ? 1 : 0)
  }
  if (rowIndex < tableData.length) {
    for (let i = 0; i < outputs.length; i++) {
      tableData[rowIndex].outputs[i] = outputs[i]
    }
    tableData[rowIndex].filled = true
  }
}

export function isTableComplete(tableData) {
  return tableData.every(row => row.filled)
}

export function verifyTable(tableData, expectedOutputs, numInputs) {
  const rows = 1 << numInputs
  for (let i = 0; i < rows; i++) {
    if (!tableData[i] || !tableData[i].filled) return false
    for (let j = 0; j < tableData[i].outputs.length; j++) {
      if (tableData[i].outputs[j] !== expectedOutputs[i][j]) return false
    }
  }
  return true
}
