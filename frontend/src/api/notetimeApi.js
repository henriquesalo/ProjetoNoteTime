import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Autenticação
export const authApi = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  registrar: async (dados) => {
    const response = await api.post('/auth/registrar', dados);
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Agendamentos
export const agendamentosApi = {
  listar: async () => {
    const response = await api.get('/agendamentos');
    return response.data.data;
  },
  
  buscar: async (id) => {
    const response = await api.get(`/agendamentos/${id}`);
    return response.data.data;
  },
  
  criar: async (dados) => {
    const response = await api.post('/agendamentos', dados);
    return response.data.data;
  },
  
  confirmar: async (id) => {
    const response = await api.patch(`/agendamentos/${id}/confirmar`);
    return response.data;
  },
  
  cancelar: async (id) => {
    const response = await api.delete(`/agendamentos/${id}`);
    return response.data;
  }
};

// Barbeiros
export const barbeirosApi = {
  listar: async () => {
    const response = await api.get('/barbeiros');
    return response.data.data;
  },
  
  listarAtivos: async () => {
    const response = await api.get('/barbeiros/ativos');
    return response.data.data;
  },
  
  buscar: async (id) => {
    const response = await api.get(`/barbeiros/${id}`);
    return response.data.data;
  },
  
  criar: async (dados) => {
    const response = await api.post('/barbeiros', dados);
    return response.data.data;
  },
  
  atualizar: async (id, dados) => {
    const response = await api.put(`/barbeiros/${id}`, dados);
    return response.data.data;
  },
  
  toggleAtivo: async (id) => {
    const response = await api.patch(`/barbeiros/${id}/toggle`);
    return response.data.data;
  }
};

// Serviços
export const servicosApi = {
  listar: async () => {
    const response = await api.get('/servicos');
    return response.data.data;
  },
  
  listarAtivos: async () => {
    const response = await api.get('/servicos/ativos');
    return response.data.data;
  },
  
  buscar: async (id) => {
    const response = await api.get(`/servicos/${id}`);
    return response.data.data;
  },
  
  criar: async (dados) => {
    const response = await api.post('/servicos', dados);
    return response.data.data;
  },
  
  atualizar: async (id, dados) => {
    const response = await api.put(`/servicos/${id}`, dados);
    return response.data.data;
  },
  
  toggleAtivo: async (id) => {
    const response = await api.patch(`/servicos/${id}/toggle`);
    return response.data.data;
  }
};

export default api;