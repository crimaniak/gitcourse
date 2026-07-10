const STORAGE_KEY = 'gitcourse'

const defaultData = {
  user: { name: 'Player' },
  progress: {},
  courseParams: {},
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...defaultData, ...JSON.parse(raw) }
    }
  } catch (e) {
    console.warn('Failed to load storage, using defaults', e)
  }
  return { ...defaultData }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function get() {
  return load()
}

function update(fn) {
  const data = load()
  fn(data)
  save(data)
  return data
}

export function getUser() {
  return get().user
}

export function setUser(user) {
  update(d => { d.user = { ...d.user, ...user } })
}

export function getCourseProgress(courseId) {
  const data = get()
  return data.progress[courseId] || { completedPages: [], currentPage: null }
}

export function setCourseProgress(courseId, progress) {
  update(d => {
    d.progress[courseId] = progress
  })
}

export function completePage(courseId, pageId) {
  update(d => {
    if (!d.progress[courseId]) {
      d.progress[courseId] = { completedPages: [], currentPage: null }
    }
    if (!d.progress[courseId].completedPages.includes(pageId)) {
      d.progress[courseId].completedPages.push(pageId)
    }
  })
}

export function setCurrentPage(courseId, pageId) {
  update(d => {
    if (!d.progress[courseId]) {
      d.progress[courseId] = { completedPages: [], currentPage: null }
    }
    d.progress[courseId].currentPage = pageId
  })
}

export function getCourseParams(courseId) {
  const data = get()
  return data.courseParams[courseId] || {}
}

export function setCourseParam(courseId, key, value) {
  update(d => {
    if (!d.courseParams[courseId]) {
      d.courseParams[courseId] = {}
    }
    d.courseParams[courseId][key] = value
  })
}

export function resetProgress(courseId) {
  update(d => {
    if (courseId) {
      delete d.progress[courseId]
      delete d.courseParams[courseId]
    } else {
      d.progress = {}
      d.courseParams = {}
    }
  })
}

export function exportData() {
  const data = get()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gitcourse-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        save(data)
        resolve(data)
      } catch (err) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
