import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export interface Team {
  id: string
  name: string
  logoUrl?: string
  location?: string
  coachName?: string
}

export interface Match {
  id: string
  team1Id: string
  team2Id: string
  team1: Team
  team2: Team
  score1: number
  score2: number
  round: string
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED'
  matchDate?: string
}

export interface Media {
  id: string
  imageUrl: string
  description?: string
  category?: string
}

export interface Tournament {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  isActive: boolean
}

export const teamsApi = {
  getAll: () => api.get<Team[]>('/teams').then((res) => res.data),
  getById: (id: string) => api.get<Team>(`/teams/${id}`).then((res) => res.data),
  create: (data: Partial<Team>) => api.post<Team>('/teams', data).then((res) => res.data),
  update: (id: string, data: Partial<Team>) => api.put<Team>(`/teams/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/teams/${id}`),
}

export const matchesApi = {
  getAll: (params?: { status?: string; round?: string }) =>
    api.get<Match[]>('/matches', { params }).then((res) => res.data),
  getLive: () => api.get<Match[]>('/matches/live').then((res) => res.data),
  getBracket: () => api.get('/matches/bracket').then((res) => res.data),
  getById: (id: string) => api.get<Match>(`/matches/${id}`).then((res) => res.data),
  create: (data: Partial<Match>) => api.post<Match>('/matches', data).then((res) => res.data),
  update: (id: string, data: Partial<Match>) => api.put<Match>(`/matches/${id}`, data).then((res) => res.data),
  updateScore: (id: string, data: { score1?: number; score2?: number; status?: string }) =>
    api.patch<Match>(`/matches/${id}/score`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/matches/${id}`),
}

export const mediaApi = {
  getAll: (category?: string) => api.get<Media[]>('/media', { params: { category } }).then((res) => res.data),
  create: (data: Partial<Media>) => api.post<Media>('/media', data).then((res) => res.data),
  update: (id: string, data: Partial<Media>) => api.put<Media>(`/media/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/media/${id}`),
}

export const tournamentsApi = {
  getAll: () => api.get<Tournament[]>('/tournaments').then((res) => res.data),
  getActive: () => api.get<Tournament>('/tournaments/active').then((res) => res.data),
  update: (id: string, data: Partial<Tournament>) =>
    api.put<Tournament>(`/tournaments/${id}`, data).then((res) => res.data),
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  logout: () => api.post('/auth/logout'),
}
