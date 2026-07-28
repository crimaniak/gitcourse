export class SimulationManager {
  constructor() {
    this.workspace = null
    this.signals = []
    this.buttons = []
    this._labelMap = {}
    this._onChange = null
  }

  init(simulation) {
    this.dispose()
    const container = document.getElementById('simcir-container')
    if (!container) return
    this.workspace = simcir.createWorkspace(simulation)
    container.appendChild(this.workspace[0])
    this._rebuildLabelMap()
    this._attachEvents()
  }

  dispose() {
    if (this.workspace) {
      try { this.workspace.trigger('dispose') } catch (e) {}
      this.workspace = null
    }
    const container = document.getElementById('simcir-container')
    if (container) container.innerHTML = ''
    this.signals = []
    this.buttons = []
    this._labelMap = {}
  }

  _rebuildLabelMap() {
    this._labelMap = {}
    if (!this.workspace) return
    const map = this._labelMap
    try {
      simcir.$(this.workspace).find('.simcir-device').each(function() {
        const el = this
        const ctrl = simcir.controller(simcir.$(el))
        map[ctrl.getLabel()] = ctrl.id
      })
    } catch (e) {}
  }

  _attachEvents() {
    this.workspace.on('schemaChange', (e, detail) => {
      if (detail && detail.signals) this.signals = detail.signals
      if (detail && detail.buttons) this.buttons = detail.buttons
      this._rebuildLabelMap()
      if (this._onChange) this._onChange()
    })
  }

  onChange(callback) {
    this._onChange = callback
  }

  resolveLabel(label) {
    return this._labelMap[label] || label
  }
}
