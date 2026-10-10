// Centralized API client for ACME Salary Management Platform

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_HR_TOKEN = 'acme-hr-sec-token-2026';

export function getAuthToken() {
  return localStorage.getItem('acme_auth_token') || DEFAULT_HR_TOKEN;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('acme_auth_token', token);
  } else {
    localStorage.removeItem('acme_auth_token');
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getAuthToken();

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.errors?.join(', ') || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const Api = {
  // Authentication
  login: async (email, password) => {
    const data = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/api/v1/auth/logout', { method: 'DELETE' });
    } finally {
      setAuthToken(null);
    }
  },

  getMe: () => request('/api/v1/auth/me'),

  // Employees
  getEmployees: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/api/v1/employees?${query.toString()}`);
  },

  getEmployee: (id) => request(`/api/v1/employees/${id}`),

  createEmployee: (employeeData) =>
    request('/api/v1/employees', {
      method: 'POST',
      body: JSON.stringify({ employee: employeeData }),
    }),

  updateEmployee: (id, employeeData) =>
    request(`/api/v1/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ employee: employeeData }),
    }),

  updateSalary: (id, payload) =>
    request(`/api/v1/employees/${id}/salary`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Analytics
  getOverview: () => request('/api/v1/analytics/overview'),
  getByDepartment: () => request('/api/v1/analytics/by_department'),
  getByCountry: () => request('/api/v1/analytics/by_country'),
  getSalaryBands: () => request('/api/v1/analytics/salary_bands'),
  getInsights: () => request('/api/v1/analytics/insights'),
};
