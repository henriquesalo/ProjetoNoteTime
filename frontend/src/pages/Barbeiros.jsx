import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barbeirosApi } from '../api/notetimeApi';
import { Users, Plus, Phone, Mail, X } from 'lucide-react';

export default function Barbeiros() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    especialidades: '',
  });

  const { data, isLoading, isError } = useQuery(['barbeiros'], barbeirosApi.getBarbeiros);

  const criarBarbeiro = useMutation(barbeirosApi.createBarbeiro, {
    onSuccess: () => {
      queryClient.invalidateQueries(['barbeiros']);
      setShowModal(false);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        especialidades: '',
      });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    criarBarbeiro.mutate(formData);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users size={24} /> Barbeiros
      </h2>

      <button
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        onClick={() => setShowModal(true)}
      >
        <Plus size={18} /> Novo Barbeiro
      </button>

      {isLoading && <p>Carregando barbeiros...</p>}
      {isError && <p>Erro ao carregar barbeiros. Tente novamente mais tarde.</p>}

      {!isLoading && !isError && (
        <>
          {data && data.length > 0 ? (
            <ul>
              {data.map((barbeiro) => (
                <li
                  key={barbeiro.id}
                  style={{
                    background: '#f3f3f3',
                    marginBottom: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                  }}
                >
                  <strong>{barbeiro.nome}</strong>
                  {barbeiro.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={14} /> {barbeiro.email}
                    </div>
                  )}
                  {barbeiro.telefone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={14} /> {barbeiro.telefone}
                    </div>
                  )}
                  {barbeiro.especialidades && (
                    <div>Especialidades: {barbeiro.especialidades}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum barbeiro cadastrado.</p>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">Cadastrar barbeiro</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={formData.senha}
                onChange={e => setFormData({ ...formData, senha: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Corte, Barba, Sobrancelha"
                value={formData.especialidades}
                onChange={e => setFormData({ ...formData, especialidades: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
              <button
                type="submit"
                disabled={criarBarbeiro.isPending}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {criarBarbeiro.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
