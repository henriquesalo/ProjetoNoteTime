import { randomUUID } from 'crypto';
import { Barbeiro } from '../domain/Barbeiro.js';
import { BarbeiroRepository } from '../repositories/BarbeiroRepository.js';

const barbeiroRepo = new BarbeiroRepository();

export class BarbeiroController {
  async listar(req, res) {
    try {
      const barbeiros = await barbeiroRepo.listarTodos();
      res.json({ success: true, data: barbeiros });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listarAtivos(req, res) {
    try {
      const barbeiros = await barbeiroRepo.listarAtivos();
      res.json({ success: true, data: barbeiros });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const barbeiro = await barbeiroRepo.buscarPorId(id);
      
      if (!barbeiro) {
        return res.status(404).json({ success: false, error: 'Barbeiro não encontrado' });
      }
      
      res.json({ success: true, data: barbeiro });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async criar(req, res) {
    try {
      const { nome, email, telefone, especialidades, senha } = req.body;

      // Validar campos obrigatórios
      if (!nome || !email || !telefone || !senha) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nome, email, telefone e senha são obrigatórios' 
        });
      }

      const barbeiro = new Barbeiro({
        id: randomUUID(),
        nome,
        email,
        telefone,
        especialidades: especialidades || [],
        ativo: true,
        fotoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nome}`
      });

      await barbeiroRepo.criar(barbeiro, senha);

      res.status(201).json({ success: true, data: barbeiro });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, telefone, especialidades } = req.body;

      const barbeiro = await barbeiroRepo.buscarPorId(id);
      
      if (!barbeiro) {
        return res.status(404).json({ success: false, error: 'Barbeiro não encontrado' });
      }

      // Atualizar campos
      if (nome) barbeiro.nome = nome;
      if (email) barbeiro.email = email;
      if (telefone) barbeiro.telefone = telefone;
      if (especialidades) barbeiro.especialidades = especialidades;

      await barbeiroRepo.atualizar(barbeiro);

      res.json({ success: true, data: barbeiro });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async toggleAtivo(req, res) {
    try {
      const { id } = req.params;
      const barbeiro = await barbeiroRepo.buscarPorId(id);
      
      if (!barbeiro) {
        return res.status(404).json({ success: false, error: 'Barbeiro não encontrado' });
      }

      if (barbeiro.ativo) {
        barbeiro.desativar();
      } else {
        barbeiro.ativar();
      }

      await barbeiroRepo.atualizar(barbeiro);

      res.json({ 
        success: true, 
        data: barbeiro,
        message: `Barbeiro ${barbeiro.ativo ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}