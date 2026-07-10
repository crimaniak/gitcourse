import { BOOLEAN_COURSE } from './boolean-functions/index.js'

const registry = [
  BOOLEAN_COURSE,
]

export function getAllCourses() {
  return [...registry]
}

export function getCourse(id) {
  return registry.find(c => c.id === id) || null
}
