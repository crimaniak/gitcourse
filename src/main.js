import { createApp, reactive } from 'petite-vue'
import { getAllCourses, getCourse } from './courses/index.js'
import { computeGate, getGateDef } from './courses/boolean-functions/index.js'
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

function buildSVGString(svgData, inputs, output) {
  const { markup, viewBox, inputY, outputY } = svgData
  const w = viewBox.w
  const h = viewBox.h

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="max-width:400px;display:block;margin:0 auto;">`
  svg += `<defs><style>
    .gs path,.gs polyline,.gs rect,.gs circle{stroke:var(--gate-body-stroke)!important}
    .gs path:not([fill="none"]){fill:var(--gate-body-fill)!important}
    .gs rect{fill:var(--gate-body-fill)!important}
    .gs text{fill:var(--gate-body-stroke)!important;font-family:sans-serif}
    .gls{font-family:sans-serif;font-size:11px;font-weight:700}
  </style></defs>`
  svg += `<g class="gs">${markup}</g>`

  for (let i = 0; i < inputY.length; i++) {
    const c = inputs[i] ? 'var(--gate-high)' : 'var(--gate-low)'
    svg += `<text x="2" y="${inputY[i] + 4}" class="gls" fill="${c}">${inputs[i]}</text>`
  }

  const oc = output ? 'var(--gate-high)' : 'var(--gate-low)'
  svg += `<text x="${w - 2}" y="${outputY + 4}" class="gls" fill="${oc}" text-anchor="end">${output}</text>`
  svg += '</svg>'
  return svg
}

// ─── Reactive state (exported for hash listener) ───
export const state = reactive({
  view: 'home',
  courseId: '',
  pageId: '',
  inputs: [],

  userNameInput: '',
  nameSaved: false,
  importStatus: '',

  // Incremented on every localStorage mutation to trigger re-renders
  _revision: 0,

  // ─── Getters ───
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
  get numInputs() {
    return this.page ? this.page.inputs : 0
  },
  get headerIndices() {
    const n = this.numInputs
    return Array.from({ length: n }, (_, i) => i)
  },
  get currentPageId() {
    void this._revision
    const p = this.course ? getCourseProgress(this.course.id) : null
    return p ? p.currentPage : null
  },
  get truthRows() {
    if (!this.page) return []
    const gateDef = getGateDef(this.page.gateType)
    if (!gateDef) return []
    return gateDef.truthTable().map(row => ({
      inputs: row.inputs,
      output: row.output,
      active: row.inputs.every((v, i) => v === this.inputs[i]),
    }))
  },
  get output() {
    if (!this.page || this.inputs.length === 0) return 0
    return computeGate(this.page.gateType, this.inputs)
  },
  get gateSVG() {
    if (!this.page) return ''
    void this._revision
    const gateDef = getGateDef(this.page.gateType)
    if (!gateDef) return ''
    const std = getCourseParams(this.courseId)['gate-standard'] || 'ansi'
    return buildSVGString(gateDef.svg(std), this.inputs, this.output)
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

  // ─── Methods ───
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

  inputLabel(i) {
    return String.fromCharCode(65 + i)
  },

  goHome() { window.location.hash = '#/' },
  goToCourse(id) { window.location.hash = '#/course/' + id },
  goToSettings() { window.location.hash = '#/settings' },

  goToPage(courseId, pageId) {
    window.location.hash = '#/page/' + courseId + '/' + pageId
  },

  resumeCourse() {
    const p = getCourseProgress(this.courseId)
    const target = p.currentPage || this.course.pages[0].id
    this.goToPage(this.courseId, target)
  },

  finishCourse() {
    window.location.hash = '#/course/' + this.courseId
  },

  toggleInput(i) {
    this.inputs[i] = this.inputs[i] ? 0 : 1
  },

  onParamChange(key, event) {
    setCourseParam(this.courseId, key, event.target.value)
    this._revision++
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

// ─── Mount ───
createApp(state).mount()

// ─── Hash router ───
function syncFromHash() {
  const hash = window.location.hash.slice(1) || '/'
  if (hash === '/' || hash === '') {
    state.view = 'home'
  } else if (hash.startsWith('/course/')) {
    state.view = 'course'
    state.courseId = hash.slice(8).split('/')[0]
    state.pageId = ''
  } else if (hash.startsWith('/page/')) {
    const parts = hash.slice(6).split('/')
    if (parts.length >= 2) {
      state.courseId = parts[0]
      state.pageId = parts[1]
      state.view = 'page'
      const c = getCourse(state.courseId)
      const p = c ? c.pages.find(pg => pg.id === state.pageId) : null
      if (p) {
        state.inputs = new Array(p.inputs).fill(0)
        setCurrentPage(state.courseId, state.pageId)
        completePage(state.courseId, state.pageId)
        state._revision++
      }
    }
  } else if (hash === '/settings') {
    state.view = 'settings'
    state.userNameInput = getUser().name
    state.nameSaved = false
    state.importStatus = ''
  }
}

window.addEventListener('hashchange', syncFromHash)
syncFromHash()
