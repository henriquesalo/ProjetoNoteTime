import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/notetimeApi';
import { Users, Phone, Mail, Calendar, IdCard, Search, UserPlus, User, Lock } from 'lucide-react';

// Telefone: (11) 99999-9999
const formatarTelefone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
};

// CPF: 999.999.999-99
const formatarCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

const initialFormState = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  dataNascimento: ''
};

export default function Clientes() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(initialFormState);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', search],
    queryFn: () => clientesApi.listar(search || undefined)
  });

  const criarCliente = useMutation({
    mutationFn: (data) => clientesApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes']);
      setFormData(initialFormState);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    // Enviar sem máscara
    const payload = {
      ...formData,
      telefone: formData.telefone.replace(/\D/g, ''),
      cpf: formData.cpf.replace(/\D/g, '')
    };

    criarCliente.mutate(payload);
  };

  // Estilos Comuns
  const inputStyle = "w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all";
  const primaryButtonStyle = (isPending) => `w-full font-bold py-4 rounded-xl text-white bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-300 ease-out ${isPending ? 'opacity-50 cursor-wait' : 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.98]'}`;


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            Clientes
          </h1>
          <p className="text-zinc-400">
            Consulte e cadastre clientes em poucos cliques
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou CPF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputStyle} pl-10`}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de clientes */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/5 text-center text-zinc-400">
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/5 text-center text-zinc-400">
              <UserPlus className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
              Nenhum cliente encontrado.
            </div>
          ) : (
            clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/5 transition-all hover:border-amber-500/30"
              >
                <div className="flex justify-between items-start mb-4 border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{cliente.nome}</h3>
                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium mt-1 border ${
                        cliente.ativo
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  {/* Botão de Ação futura aqui */}
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-y-3 text-sm">
                  {cliente.email && (
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Mail className="w-4 h-4 text-zinc-500" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    <span>{cliente.telefone}</span>
                  </div>
                  {cliente.cpf && (
                    <div className="flex items-center gap-3 text-zinc-400">
                      <IdCard className="w-4 h-4 text-zinc-500" />
                      <span>{cliente.cpf}</span>
                    </div>
                  )}
                  {cliente.dataNascimento && (
                    <div className="flex items-center gap-3 text-zinc-400">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      <span>
                        Nascido em: {new Date(cliente.dataNascimento).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1 sticky top-6">
          <div className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">
              <UserPlus className="inline w-6 h-6 mr-3 text-amber-500" />
              Novo Cliente
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className={inputStyle}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputStyle}
                  placeholder="opcional@email.com"
                />
              </div>
              
              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefone: formatarTelefone(e.target.value)
                    })
                  }
                  className={inputStyle}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              {/* CPF */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpf: formatarCPF(e.target.value)
                    })
                  }
                  className={inputStyle}
                  placeholder="000.000.000-00"
                />
              </div>

              {/* Data Nascimento */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-xs font-medium ml-1 uppercase tracking-wider">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dataNascimento: e.target.value
                    })
                  }
                  className={inputStyle}
                />
              </div>

              {criarCliente.isError && (
                <div className="text-sm text-red-400 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  {criarCliente.error?.response?.data?.error ||
                    'Erro ao salvar cliente'}
                </div>
              )}

              <button
                type="submit"
                disabled={criarCliente.isPending}
                className={primaryButtonStyle(criarCliente.isPending)}
              >
                {criarCliente.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}