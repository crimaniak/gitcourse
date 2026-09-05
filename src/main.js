import './styles/main.css'
import { createApp, reactive } from 'petite-vue'
import { getAllCourses, getCourse } from './courses/index.js'
import { getInputCombination, getOutputValues } from './courses/boolean-functions/table.js'
import { TruthTable } from './courses/boolean-functions/TruthTable.js'
import { SimulationManager } from './courses/boolean-functions/SimulationManager.js'
import { createTranslator } from './i18n/index.js'
import { createTranslateDirective } from './i18n/translateDirective.js'
import {
  getUser,
  setUser,
  getLanguage,
  setLanguage,
  getCourseProgress,
  getCourseParams,
  setCourseParam,
  setCurrentPage,
  completePage,
  exportData as exportStorage,
  importData as importStorage,
  resetProgress,
} from './storage.js'

const sim = new SimulationManager()

const language = getLanguage()
const translator = createTranslator(language)

export const state = reactive({
  view: 'home',
  courseId: '',
  pageId: '',
  language,

  userNameInput: '',
  nameSaved: false,
  importStatus: '',

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
    return getAllCourses().map(c => translator.translateObject(c))
  },
  get course() {
    return this.courseId ? translator.translateObject(getCourse(this.courseId)) : null
  },
  get pageIndex() {
    const c = this.course
    return c ? c.pages.findIndex(p => p.id === this.pageId) : -1
  },
  get prevPage() {
    const c = this.course, idx = this.pageIndex
    return c && idx > 0 ? c.pages[idx - 1] : null
  },
  get nextPage() {
    const c = this.course, idx = this.pageIndex
    return c && idx >= 0 && idx < c.pages.length - 1 ? c.pages[idx + 1] : null
  },
  get page() {
    const c = this.course
    return c ? c.pages.find(p => p.id === this.pageId) : null
  },
  get tableConfig() {
    return this.page ? this.page.tableConfig : null
  },
  get tableRows() {
    return this.tableData ? this.tableData.getRows() : []
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
    const resolve = lbl => sim.resolveLabel(lbl)
    const result = page.checkSolution(sim.signals, sim.buttons, this.tableData, resolve, sim.getSchema())
    this.isCorrect = result.correct
    if (result.correct) {
      this.resultMessage = translator.translateObject('✅ Correct!')
      this.solutionChecked = true
      completePage(this.courseId, this.pageId)
      this._revision++
    } else {
      this.resultMessage = '❌ ' + translator.translateObject(result.hint || 'Try again.')
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

  onLanguageChange(event) {
    setLanguage(event.target.value)
    window.location.reload()
  },

  exportData() { exportStorage() },

  triggerImport() {
    document.querySelector('input[type=file]').click()
  },

  importData(event) {
    const file = event.target.files[0]
    if (!file) return
    this.importStatus = translator.translateObject('Importing...')
    importStorage(file)
      .then(() => {
        this._revision++
        this.importStatus = translator.translateObject('✅ Data imported! Reloading...')
        setTimeout(() => window.location.reload(), 1000)
      })
      .catch((err) => {
        this.importStatus = '❌ ' + translator.translateObject(err.message)
      })
  },

  resetAll() {
    if (confirm(translator.translateObject('Delete ALL progress for all courses? This cannot be undone!'))) {
      resetProgress()
      this.importStatus = translator.translateObject('✅ All progress reset.')
      setTimeout(() => window.location.reload(), 1000)
    }
  },

  startOver() {
    if (confirm(translator.translateObject('Reset all progress for this course?'))) {
      resetProgress(this.courseId)
      setCurrentPage(this.courseId, this.course.pages[0].id)
      this._revision++
    }
  },
})

createApp(state)
  .directive('translate', createTranslateDirective(translator))
  .mount()

sim.onChange(() => {
  const tc = state.tableConfig
  if (tc && state.tableData) {
    const inputIds = tc.inputLabels.map(lbl => sim.resolveLabel(lbl))
    const outputIds = tc.outputLabels.map(lbl => sim.resolveLabel(lbl))
    const inputs = getInputCombination(sim.signals, inputIds, sim.buttons)
    const outputs = getOutputValues(sim.signals, outputIds)
    state.tableData.update(inputs, outputs)
    state._revision++
  }
})

window.addEventListener('hashchange', syncFromHash)
syncFromHash()

document.documentElement.lang = language
document.title = translator.translateObject('GitCourse — Interactive Learning')
translator.translateNode(document.getElementById('app-header'))

function syncFromHash() {
  const hash = window.location.hash.slice(1) || '/'

  if (hash === '/' || hash === '') {
    state.view = 'home'
    sim.dispose()
  } else if (hash.startsWith('/course/')) {
    state.view = 'course'
    state.courseId = hash.slice(8).split('/')[0]
    state.pageId = ''
    sim.dispose()
  } else if (hash.startsWith('/page/')) {
    const parts = hash.slice(6).split('/')
    if (parts.length >= 2) {
      state.courseId = parts[0]
      state.pageId = parts[1]
      state.view = 'page'

      import(`./courses/${state.courseId}/course.css`).catch(() => {})

      const c = state.course
      const p = c ? c.pages.find(pg => pg.id === state.pageId) : null
      if (p) {
        state.resultMessage = ''
        state.isCorrect = false
        state.solutionChecked = (getCourseProgress(state.courseId).completedPages || []).includes(state.pageId)
        state.tableData = null

        if (p.tableConfig) {
          state.tableData = new TruthTable(p.tableConfig.inputLabels, p.tableConfig.outputLabels, p.tableConfig.expected)
        }

        setCurrentPage(state.courseId, state.pageId)
        state._revision++

        requestAnimationFrame(() => {
          if (p.simulation) {
            sim.init(JSON.parse(JSON.stringify(p.simulation)))
            const ttc = document.getElementById('truth-table-container')
            if (ttc && state.tableData) {
              state.tableData.render(ttc)
              translator.translateNode(ttc)
            }
          }
        })
      }
    }
  } else if (hash === '/settings') {
    state.view = 'settings'
    state.userNameInput = getUser().name
    state.nameSaved = false
    state.importStatus = ''
    sim.dispose()
  }
}
