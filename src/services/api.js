const BASE_URL = 'http://127.0.0.1:5000/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error('Error en la petición')
  }

  return response.json()
}

export const api = {
  // Empleados
  getEmpleados: () => request('/todosEmpleados'),
  getEmpleado: (id) => request(`/empleados/${id}`),
  createEmpleado: (data) => request('/empleados', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateEmpleado: (id, data) => request(`/empleados/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteEmpleado: (id) => request(`/empleados/${id}`, {
    method: 'DELETE'
  }),

  //roles
  getRoles: () => request('/roles'),

  // Calendario
  getCalendario: (id) => request(`/calendario/${id}`),

  // Schedules
  // getSchedules: (id) => request(`/horariosempleado/${id}`),

  // Work centers
  getWorkCenters: () => request('/centros'),

  // Festivos
  getFestivos: () => request('/festivos'),
  createFestivo: (data) => request('/festivos', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateFestivo: (id, data) => request(`/festivos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteFestivo: (id) => request(`/festivos/${id}`, {
    method: 'DELETE'
  }),
  getHorariosEmpleado: (id) => request(`/horariosempleado/${id}`),
}
