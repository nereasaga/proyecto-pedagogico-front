const BASE_URL = ''

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
  getEmpleados: () => request('http://127.0.0.1:5000/api/todosEmpleados'),
  getEmpleado: (id) => request(`http://127.0.0.1:5000/api/empleados/${id}`),
  createEmpleado: (data) => request('http://127.0.0.1:5000/api/empleados', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateEmpleado: (id, data) => request(`http://127.0.0.1:5000/api/empleados/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteEmpleado: (id) => request(`http://127.0.0.1:5000/api/empleados/${id}`, {
    method: 'DELETE'
  }),

  // Calendario
  getCalendario: (userId) => request(`http://127.0.0.1:5000/api/calendario/${userId}`)
}