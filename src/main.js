import { createApp, reactive } from 'petite-vue'
import { getAllCourses, getCourse } from './courses/index.js'
import { createTableData, updateTableRow, getInputCombination, getOutputValues } from './courses/boolean-functions/table.js'
import {
  getUser,
  setUser,
  getCourseProgress,
  getCourseParams,
  setCourseParam,
  setCurrentPage,
  completePage,
  exportData as exportStorage,
  importData as importStorage,
  resetProgress,
} from './storage.js'

export const state = reactive({
  view: 'home',
  courseId: '',
  pageId: '',

  userNameInput: '',
  nameSaved: false,
  importStatus: '',

  // Simcir workspace reference
  simContainer: null,
  workspace: null,
  tableData: null,
  resultMessage: '',
  isCorrect: false,
  solutionChecked: false,

  _revision: 0,

  get user() {
    void this._revision
    return getUser()
  },
  get courses() {
    return getAllCourses()
  },
  get course() {
    return this.courseId ? getCourse(this.courseId) : null
  },
  get pageIndex() {
    const c = this.course
    return c ? c.pages.findIndex(p => p.id === this.pageId) : -1
  },
  get page() {
    const c = this.course
    return c ? c.pages.find(p => p.id === this.pageId) : null
  },
  get tableConfig() {
    return this.page ? this.page.tableConfig : null
  },
  get tableRows() {
    return this.tableData || []
  },
  get currentPageId() {
    void this._revision
    const p = this.course ? getCourseProgress(this.course.id) : null
    return p ? p.currentPage : null
  },
  get courseParams() {
    const c = this.course
    if (!c || !c.parameters) return []
    void this._revision
    const saved = getCourseParams(this.courseId)
    return Object.entries(c.parameters).map(([key, param]) => ({
      key,
      label: param.label,
      options: param.options,
      current: saved[key] || param.defaultValue,
    }))
  },

  courseProgress(courseId) {
    void this._revision
    const p = getCourseProgress(courseId)
    const c = getCourse(courseId)
    const total = c ? c.pages.length : 0
    const completed = (p.completedPages || []).length
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 }
  },

  pageDone(pageId) {
    void this._revision
    const p = getCourseProgress(this.courseId)
    return p && (p.completedPages || []).includes(pageId)
  },

  goHome() { window.location.hash = '#/' },
  goToCourse(id) { window.location.hash = '#/course/' + id },
  goToSettings() { window.location.hash = '#/settings' },

  goToPage(courseId, pageId) {
    window.location.hash = '#/page/' + courseId + '/' + pageId
  },

  resumeCourse() {
    const p = getCourseProgress(this.courseId)
    const allCompleted = p.completedPages || []
    const pages = this.course.pages
    let target = pages[0].id
    for (const page of pages) {
      if (!allCompleted.includes(page.id)) {
        target = page.id
        break
      }
    }
    this.goToPage(this.courseId, target)
  },

  finishCourse() {
    window.location.hash = '#/course/' + this.courseId
  },

  onParamChange(key, event) {
    setCourseParam(this.courseId, key, event.target.value)
    this._revision++
  },

  checkSolution() {
    if (this.solutionChecked) return
    const page = this.page
    if (!page) return
    const signals = this._currentSignals || []
    const buttons = this._currentButtons || []
    const resolve = lbl => (state._labelMap && state._labelMap[lbl]) || lbl
    const result = page.checkSolution(signals, buttons, this.tableData, resolve)
    this.isCorrect = result.correct
    if (result.correct) {
      this.resultMessage = '✅ Correct!'
      this.solutionChecked = true
      completePage(this.courseId, this.pageId)
      this._revision++
    } else {
      this.resultMessage = '❌ ' + (result.hint || 'Try again.')
      this.solutionChecked = false
    }
  },

  saveName() {
    const name = this.userNameInput.trim()
    if (name) {
      setUser({ name })
      this._revision++
      this.nameSaved = true
      setTimeout(() => { this.nameSaved = false }, 2000)
    }
  },

  exportData() { exportStorage() },

  triggerImport() {
    document.querySelector('input[type=file]').click()
  },

  importData(event) {
    const file = event.target.files[0]
    if (!file) return
    this.importStatus = 'Importing...'
    importStorage(file)
      .then(() => {
        this._revision++
        this.importStatus = '✅ Data imported! Reloading...'
        setTimeout(() => window.location.reload(), 1000)
      })
      .catch((err) => {
        this.importStatus = '❌ ' + err.message
      })
  },

  resetAll() {
    if (confirm('Delete ALL progress for all courses? This cannot be undone!')) {
      resetProgress()
      this.importStatus = '✅ All progress reset.'
      setTimeout(() => window.location.reload(), 1000)
    }
  },

  startOver() {
    if (confirm('Reset all progress for this course?')) {
      resetProgress(this.courseId)
      setCurrentPage(this.courseId, this.course.pages[0].id)
      this._revision++
    }
  },
})

createApp(state).mount()

function disposeWorkpace() {
  if (state.workspace) {
    try {
      state.workspace.trigger('dispose')
    } catch (e) {}
    state.workspace = null
  }
  const container = document.getElementById('simcir-container')
  if (container) container.innerHTML = ''
}

function initWorkspace(simulation) {
  disposeWorkpace()
  const container = document.getElementById('simcir-container')
  if (!container) return

  const ws = simcir.createWorkspace(simulation)
  container.appendChild(ws[0])
  state.workspace = ws

  state._currentSignals = []
  state._currentButtons = []
  state._labelMap = {}

  try {
    simcir.$(ws).find('.simcir-device').each(function() {
      const ctrl = simcir.controller(simcir.$(this))
      state._labelMap[ctrl.getLabel()] = ctrl.id
    })
  } catch (e) {}

  ws.on('schemaChange', function(e, detail) {
    if (detail && detail.signals) state._currentSignals = detail.signals
    if (detail && detail.buttons) state._currentButtons = detail.buttons

    const tableConfig = state.tableConfig
    if (tableConfig && state.tableData && state._labelMap) {
      const inputIds = tableConfig.inputLabels.map(lbl => state._labelMap[lbl])
      const outputIds = tableConfig.outputLabels.map(lbl => state._labelMap[lbl])
      const inputs = getInputCombination(state._currentSignals, inputIds)
      const outputs = getOutputValues(state._currentSignals, outputIds)
      updateTableRow(state.tableData, inputs, outputs)
      state._revision++
    }
  })
}

window.addEventListener('hashchange', syncFromHash)
syncFromHash()

function syncFromHash() {
  const hash = window.location.hash.slice(1) || '/'

  if (hash === '/' || hash === '') {
    state.view = 'home'
    disposeWorkpace()
  } else if (hash.startsWith('/course/')) {
    state.view = 'course'
    state.courseId = hash.slice(8).split('/')[0]
    state.pageId = ''
    disposeWorkpace()
  } else if (hash.startsWith('/page/')) {
    const parts = hash.slice(6).split('/')
    if (parts.length >= 2) {
      state.courseId = parts[0]
      state.pageId = parts[1]
      state.view = 'page'

      const c = getCourse(state.courseId)
      const p = c ? c.pages.find(pg => pg.id === state.pageId) : null
      if (p) {
        state.resultMessage = ''
        state.isCorrect = false
        state.solutionChecked = (getCourseProgress(state.courseId).completedPages || []).includes(state.pageId)
        state.tableData = null

        if (p.tableConfig) {
          state.tableData = createTableData(p.tableConfig.inputLabels, p.tableConfig.outputLabels)
        }

        setCurrentPage(state.courseId, state.pageId)
        state._revision++

        requestAnimationFrame(() => {
          if (p.simulation) {
            initWorkspace(p.simulation)
          }
        })
      }
    }
  } else if (hash === '/settings') {
    state.view = 'settings'
    state.userNameInput = getUser().name
    state.nameSaved = false
    state.importStatus = ''
    disposeWorkpace()
  }
}
