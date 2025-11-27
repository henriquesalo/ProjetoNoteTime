import { randomUUID } from 'crypto';
import { Servico } from '../domain/Servico.js';
import { ServicoRepository } from '../repositories/ServicoRepository.js';

const servicoRepo = new ServicoRepository();

export class ServicoController {
  async listar(req, res) {
    try {
      const servicos = await servicoRepo.listarTodos();
      res.json({ success: true, data: servicos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listarAtivos(req, res) {
    try {
      const servicos = await servicoRepo.listarAtivos();
      res.json({ success: true, data: servicos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const servico = await servicoRepo.buscarPorId(id);
      
      if (!servico) {
        return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
      }
      
      res.json({ success: true, data: servico });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async criar(req, res) {
    try {
      const { nome, descricao, preco, duracaoMinutos } = req.body;

      // Validar campos obrigatórios
      if (!nome || !preco || !duracaoMinutos) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nome, preço e duração são obrigatórios' 
        });
      }

      const servico = new Servico({
        id: randomUUID(),
        nome,
        descricao: descricao || '',
        preco: parseFloat(preco),
        duracaoMinutos: parseInt(duracaoMinutos),
        ativo: true
      });

      await servicoRepo.criar(servico);

      res.status(201).json({ success: true, data: servico });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, duracaoMinutos } = req.body;

      const servico = await servicoRepo.buscarPorId(id);
      
      if (!servico) {
        return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
      }

      // Atualizar campos
      if (nome) servico.nome = nome;
      if (descricao) servico.descricao = descricao;
      if (preco) servico.preco = parseFloat(preco);
      if (duracaoMinutos) servico.duracaoMinutos = parseInt(duracaoMinutos);

      await servicoRepo.atualizar(servico);

      res.json({ success: true, data: servico });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async toggleAtivo(req, res) {
    try {
      const { id } = req.params;
      const servico = await servicoRepo.buscarPorId(id);
      
      if (!servico) {
        return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
      }

      if (servico.ativo) {
        servico.desativar();
      } else {
        servico.ativar();
      }

      await servicoRepo.atualizar(servico);

      res.json({ 
        success: true, 
        data: servico,
        message: `Serviço ${servico.ativo ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}