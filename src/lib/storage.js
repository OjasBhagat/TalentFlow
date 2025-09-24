import localforage from 'localforage'

const database = localforage.createInstance({ name: 'talentflow' })

export const CANDIDATE_STAGES = [
  'Applied',
  'Phone Screen',
  'Onsite',
  'Offer',
  'Hired',
  'Rejected',
]

const storageService = {
  // getJobs optionally accepts a query object { search, status, page, pageSize, sort, tags }
  async getJobs(queryParams = {}) {
    const allJobs = (await database.getItem('jobs')) || []
    if (!queryParams || Object.keys(queryParams).length === 0) return allJobs
    let filteredJobs = allJobs.slice()
    const { search, status, page = 1, pageSize = 25, sort, tags, type } = queryParams
    if (search) {
      const searchTerm = String(search).toLowerCase()
      filteredJobs = filteredJobs.filter((job) => (job.title || '').toLowerCase().includes(searchTerm) || (job.slug || '').toLowerCase().includes(searchTerm))
    }
    if (status && status !== 'all') {
      const statusFilter = String(status).toLowerCase()
      if (statusFilter === 'active') {
        filteredJobs = filteredJobs.filter((job) => !(job.archived === true) && (String(job.status || 'active').toLowerCase() !== 'archived') && (String(job.status || '').toLowerCase() !== 'filled'))
      } else if (statusFilter === 'archived') {
        filteredJobs = filteredJobs.filter((job) => (job.archived === true) || (String(job.status || '').toLowerCase() === 'archived'))
      } else if (statusFilter === 'filled') {
        filteredJobs = filteredJobs.filter((job) => String(job.status || '').toLowerCase() === 'filled' && !(job.archived === true))
      } else {
        filteredJobs = filteredJobs.filter((job) => String(job.status || 'active').toLowerCase() === statusFilter)
      }
    }
    if (type && type !== 'All' && type !== 'all') {
      const typeFilter = String(type).toLowerCase()
      filteredJobs = filteredJobs.filter((job) => String(job.type || 'Full-time').toLowerCase() === typeFilter)
    }
    if (tags && Array.isArray(tags) && tags.length) {
      filteredJobs = filteredJobs.filter((job) => Array.isArray(job.tags) && tags.every((tag) => job.tags.includes(tag)))
    }
    if (sort === 'title') filteredJobs.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    else if (sort === 'order') filteredJobs.sort((a, b) => (a.order || 0) - (b.order || 0))
    // pagination
    const totalCount = filteredJobs.length
    const currentPage = Math.max(1, Number(page) || 1)
    const itemsPerPage = Math.max(1, Number(pageSize) || 25)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = filteredJobs.slice(startIndex, startIndex + itemsPerPage)
    return { jobs: paginatedItems, total: totalCount }
  },
  async saveJobs(jobList) {
    return database.setItem('jobs', jobList)
  },
  async updateJob(jobId, updateData) {
    const allJobs = (await database.getItem('jobs')) || []
    const updatedJobs = allJobs.map((job) => (String(job.id) === String(jobId) ? { ...job, ...updateData } : job))
    await database.setItem('jobs', updatedJobs)
    return updatedJobs.find((job) => String(job.id) === String(jobId))
  },
  async archiveJob(jobId, isArchived = true) {
    const allJobs = (await database.getItem('jobs')) || []
    const updatedJobs = allJobs.map((job) => (String(job.id) === String(jobId) ? { ...job, archived: isArchived } : job))
    await database.setItem('jobs', updatedJobs)
    return updatedJobs.find((job) => String(job.id) === String(jobId))
  },
  async reorderJobs(orderedIds) {
    // orderedIds is an array of job ids in the desired order
    const allJobs = (await database.getItem('jobs')) || []
    const jobMap = new Map(allJobs.map((job) => [String(job.id), job]))
    const reorderedJobs = orderedIds.map((id) => jobMap.get(String(id))).filter(Boolean)
    // include any jobs not present in orderedIds at the end
    for (const job of allJobs) {
      if (!orderedIds.includes(String(job.id))) reorderedJobs.push(job)
    }
    await database.setItem('jobs', reorderedJobs)
    return reorderedJobs
  },
  async bulkUnarchive(jobIds = []) {
    const allJobs = (await database.getItem('jobs')) || []
    const updatedJobs = allJobs.map((job) => (jobIds.includes(String(job.id)) ? { ...job, archived: false } : job))
    await database.setItem('jobs', updatedJobs)
    return updatedJobs.filter((job) => jobIds.includes(String(job.id)))
  },
  // Timeline support for candidates
  async addTimelineEvent(candidateId, eventData) {
    const timelineKey = `timeline:${candidateId}`
    const timelineList = (await database.getItem(timelineKey)) || []
    timelineList.push(eventData)
    await database.setItem(timelineKey, timelineList)
    return timelineList
  },
  async getTimeline(candidateId) {
    const timelineKey = `timeline:${candidateId}`
    return (await database.getItem(timelineKey)) || []
  },
  // Candidate queries: supports { search, stage, page, pageSize }
  async getCandidates(queryParams = {}) {
    const allCandidates = (await database.getItem('candidates')) || []
    if (!queryParams || Object.keys(queryParams).length === 0) return { candidates: allCandidates, total: allCandidates.length }
    let filteredCandidates = allCandidates.slice()
    const { search, stage, page = 1, pageSize = 1000 } = queryParams  // Increased default pageSize to 1000 to show more candidates initially
    if (search) {
      const searchTerm = String(search).toLowerCase()
      filteredCandidates = filteredCandidates.filter((candidate) => (candidate.name || '').toLowerCase().includes(searchTerm) || (candidate.email || '').toLowerCase().includes(searchTerm))
    }
    if (stage && stage !== 'all') filteredCandidates = filteredCandidates.filter((candidate) => (candidate.stage || 'Applied') === stage)
    const totalCount = filteredCandidates.length
    const currentPage = Math.max(1, Number(page) || 1)
    const itemsPerPage = Math.max(1, Number(pageSize) || 1000)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedItems = filteredCandidates.slice(startIndex, startIndex + itemsPerPage)
    return { candidates: paginatedItems, total: totalCount }
  },
  // Candidates storage helpers (non-query helpers below)
  async saveCandidates(candidateList) {
    return database.setItem('candidates', candidateList)
  },
  async addCandidate(candidateData) {
    const allCandidates = (await database.getItem('candidates')) || []
    const newCandidate = { id: Date.now().toString(), stage: candidateData.stage || 'Applied', ...candidateData }
    allCandidates.push(newCandidate)
    await database.setItem('candidates', allCandidates)
    // add initial timeline event
    await storageService.addTimelineEvent(newCandidate.id, { at: Date.now(), type: 'created', stage: newCandidate.stage })
    return newCandidate
  },
  async updateCandidate(candidateId, updateData) {
    const allCandidates = (await database.getItem('candidates')) || []
    const previousCandidate = allCandidates.find((candidate) => String(candidate.id) === String(candidateId))
    const updatedCandidates = allCandidates.map((candidate) => (String(candidate.id) === String(candidateId) ? { ...candidate, ...updateData } : candidate))
    await database.setItem('candidates', updatedCandidates)
    const updatedCandidate = updatedCandidates.find((candidate) => String(candidate.id) === String(candidateId))
    if (previousCandidate && updateData && updateData.stage && updateData.stage !== previousCandidate.stage) {
      await storageService.addTimelineEvent(candidateId, { at: Date.now(), type: 'stage', from: previousCandidate.stage, to: updateData.stage })
    }
    return updatedCandidate
  },
  async deleteCandidate(candidateId) {
    let allCandidates = (await database.getItem('candidates')) || []
    allCandidates = allCandidates.filter((candidate) => String(candidate.id) !== String(candidateId))
    await database.setItem('candidates', allCandidates)
    return { success: true }
  },
  // Assessments persistence
  async getAssessment(jobId) {
    const assessmentData = (await database.getItem('assessments')) || {}
    return assessmentData[jobId] || null
  },
  async saveAssessment(jobId, assessmentPayload) {
    const assessmentData = (await database.getItem('assessments')) || {}
    assessmentData[jobId] = assessmentPayload
    await database.setItem('assessments', assessmentData)
    return assessmentData[jobId]
  },
  async submitAssessment(jobId, submissionData) {
    const submissionKey = `submissions:${jobId}`
    const submissionList = (await database.getItem(submissionKey)) || []
    submissionList.push({ id: Date.now().toString(), at: Date.now(), ...submissionData })
    await database.setItem(submissionKey, submissionList)
    // add timeline event for this candidate
    try {
      if (submissionData && submissionData.candidateId) {
        await storageService.addTimelineEvent(submissionData.candidateId, { at: Date.now(), type: 'submission', jobId })
      }
    } catch {}
    return submissionList[submissionList.length - 1]
  },
  async getSubmissions(jobId) {
    const submissionKey = `submissions:${jobId}`
    return (await database.getItem(submissionKey)) || []
  },
  // Simple candidate auth + assignments
  async createCandidateAuth(candidateId, emailAddress, password) {
    const authKey = 'candidate_auth'
    const authData = (await database.getItem(authKey)) || {}
    const normalizedEmail = String(emailAddress || '').trim().toLowerCase()
    authData[normalizedEmail] = { candidateId, email: normalizedEmail, password }
    await database.setItem(authKey, authData)
    return authData[normalizedEmail]
  },
  async getCandidateAuthByEmail(emailAddress) {
    const authData = (await database.getItem('candidate_auth')) || {}
    const normalizedEmail = String(emailAddress || '').trim().toLowerCase()
    return authData[normalizedEmail] || null
  },
  async assignAssessment(candidateId, jobId) {
    const assignmentKey = `assignments:${candidateId}`
    // single active assignment: overwrite with the latest jobId
    const assignmentArray = [jobId]
    await database.setItem(assignmentKey, assignmentArray)
    // timeline event
    await storageService.addTimelineEvent(candidateId, { at: Date.now(), type: 'assignment', jobId })
    return assignmentArray
  },
  async getAssignments(candidateId) {
    return (await database.getItem(`assignments:${candidateId}`)) || []
  },
  async addOutboxMessage(messageData) {
    const outboxKey = 'outbox'
    const messageList = (await database.getItem(outboxKey)) || []
    messageList.push({ id: Date.now().toString(), at: Date.now(), ...messageData })
    await database.setItem(outboxKey, messageList)
    return messageList[messageList.length - 1]
  },
  async getOutbox() {
    return (await database.getItem('outbox')) || []
  },
  // Development helper: clear all data
  async clearAll() {
    await database.clear()
  },
  // Seeder helper: only seed when empty
  async seedIfEmpty({ jobs = [], candidates = [], assessments = [] } = {}) {
    const existingJobs = (await database.getItem('jobs')) || []
    if (!existingJobs.length && jobs.length) {
      await database.setItem('jobs', jobs)
    }
    const existingCandidates = (await database.getItem('candidates')) || []
    if (!existingCandidates.length && candidates.length) {
      await database.setItem('candidates', candidates)
      // seed timelines
      for (const candidate of candidates) {
        await database.setItem(`timeline:${candidate.id}`, [{ at: Date.now(), type: 'seed', stage: candidate.stage }])
      }
    }
    const existingAssessments = (await database.getItem('assessments')) || {}
    if (Object.keys(existingAssessments).length === 0 && assessments.length) {
      const assessmentMap = {}
      for (const assessment of assessments) assessmentMap[assessment.jobId] = assessment
      await database.setItem('assessments', assessmentMap)
    }
  },
}

export default storageService
