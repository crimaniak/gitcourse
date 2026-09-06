export class TruthTable {
  constructor(inputLabels, outputLabels, expected, options = {}) {
    this.inputLabels = inputLabels
    this.outputLabels = outputLabels
    this.numInputs = inputLabels.length

    const rows = 1 << this.numInputs
    this.rows = []
    for (let i = 0; i < rows; i++) {
      const inputs = []
      for (let j = 0; j < this.numInputs; j++) {
        inputs.push((i >> (this.numInputs - 1 - j)) & 1)
      }
      this.rows.push({ inputs, outputs: outputLabels.map(() => '\u2013'), filled: false })
    }

    this.expected = this._normalizeExpected(expected, outputLabels.length)
    this.showReference = !!options.showReference
    this._container = null
    this._lastUpdatedRow = -1
  }

  _normalizeExpected(expected, numOutputs) {
    if (!expected) return null
    if (expected.length === 0) return []
    if (Array.isArray(expected[0])) {
      return expected.map(row => row.slice())
    }
    return expected.map(val => [val])
  }

  update(inputs, outputs) {
    let rowIndex = 0
    for (let i = 0; i < inputs.length; i++) {
      rowIndex = (rowIndex << 1) | (inputs[i] ? 1 : 0)
    }
    if (rowIndex < this.rows.length) {
      for (let i = 0; i < outputs.length; i++) {
        this.rows[rowIndex].outputs[i] = outputs[i]
      }
      this.rows[rowIndex].filled = true
      this._lastUpdatedRow = rowIndex
      if (this._container) this.updateDOM()
    }
  }

  isComplete() {
    return this.rows.every(row => row.filled)
  }

  isCorrect() {
    if (!this.expected) return false
    for (let i = 0; i < this.rows.length; i++) {
      if (!this.rows[i].filled) return false
      for (let j = 0; j < this.expected[i].length; j++) {
        if (this.rows[i].outputs[j] !== this.expected[i][j]) return false
      }
    }
    return true
  }

  getRows() {
    return this.rows
  }

  _makeTable(className, rows) {
    const table = document.createElement('table')
    table.className = className

    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    for (const label of this.inputLabels) {
      const th = document.createElement('th')
      th.textContent = label
      headerRow.appendChild(th)
    }
    for (const label of this.outputLabels) {
      const th = document.createElement('th')
      th.textContent = label
      headerRow.appendChild(th)
    }
    thead.appendChild(headerRow)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    for (const row of rows) {
      const tr = document.createElement('tr')
      for (const val of row.inputs) {
        const td = document.createElement('td')
        td.textContent = val
        tr.appendChild(td)
      }
      for (const val of row.outputs) {
        const td = document.createElement('td')
        td.textContent = val
        if (val === '\u2013') td.className = 'placeholder'
        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }
    table.appendChild(tbody)
    return table
  }

  render(container) {
    this._container = container
    container.innerHTML = ''

    const wrap = document.createElement('div')

    if (this.showReference) {
      const hasExpected = this.expected && this.expected.length === this.rows.length
      const refRows = this.rows.map((row, i) => ({
        inputs: row.inputs,
        outputs: hasExpected ? this.expected[i].slice() : row.outputs.slice(),
      }))
      const refHeading = document.createElement('h3')
      refHeading.textContent = 'Reference Truth Table'
      wrap.appendChild(refHeading)
      wrap.appendChild(this._makeTable('truth-table truth-table-reference', refRows))
    }

    const heading = document.createElement('h3')
    heading.textContent = 'Truth Table'
    wrap.appendChild(heading)

    wrap.appendChild(this._makeTable('truth-table truth-table-live', this.rows))

    container.appendChild(wrap)
  }

  updateDOM() {
    if (!this._container) return
    const tbody = this._container.querySelector('.truth-table-live tbody')
    if (!tbody) return

    const trs = tbody.querySelectorAll('tr')
    for (let i = 0; i < this.rows.length && i < trs.length; i++) {
      const tds = trs[i].querySelectorAll('td')
      const outputOffset = this.numInputs
      for (let j = 0; j < this.rows[i].outputs.length; j++) {
        const td = tds[outputOffset + j]
        if (!td) continue
        const val = this.rows[i].outputs[j]
        td.textContent = val
        td.className = val === '\u2013' ? 'placeholder' : ''
      }
    }

    const updatedTr = trs[this._lastUpdatedRow]
    if (updatedTr) {
      const tds = updatedTr.querySelectorAll('td')
      for (const td of tds) {
        td.style.transition = 'none'
        td.style.backgroundColor = 'oklch(0.85 0.2 25 / 0.5)'
      }
      void updatedTr.offsetWidth
      for (const td of tds) {
        td.style.transition = 'background-color 2s ease-out'
        td.style.backgroundColor = 'transparent'
      }
    }
    this._lastUpdatedRow = -1
  }
}
