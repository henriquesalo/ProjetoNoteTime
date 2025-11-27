import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/notetimeApi';
import { Users, Phone, Mail, Calendar, IdCard, Search, UserPlus } from 'lucide-react';

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
    criarCliente.mutate(formData);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            Clientes
          </h1>
          <p className="text-zinc-400">Consulte e cadastre clientes em poucos cliques</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou CPF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center text-zinc-400">
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 text-center text-zinc-400">
              Nenhum cliente encontrado.
            </div>
          ) : (
            clientes.map((cliente) => (
              <div key={cliente.id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
                    {cliente.nome?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{cliente.nome}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${cliente.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                      {cliente.email && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone className="w-4 h-4" />
                        <span>{cliente.telefone}</span>
                      </div>
                      {cliente.cpf && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <IdCard className="w-4 h-4" />
                          <span>{cliente.cpf}</span>
                        </div>
                      )}
                      {cliente.dataNascimento && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            Novo Cliente
          </h2>
          <p className="text-sm text-zinc-400 mb-6">Preencha os dados para cadastrar um novo cliente.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-300 mb-2 text-sm">Nome completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-2 text-sm">Telefone</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-2 text-sm">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-2 text-sm">Data de Nascimento</label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            {criarCliente.isError && (
              <div className="text-sm text-red-400">
                {criarCliente.error?.response?.data?.error || 'Erro ao salvar cliente'}
              </div>
            )}

            <button
              type="submit"
              disabled={criarCliente.isPending}
              className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {criarCliente.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

