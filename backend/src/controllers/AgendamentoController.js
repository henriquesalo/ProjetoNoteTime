import { randomUUID } from 'crypto';
import { Agendamento } from '../domain/Agendamento.js';
import { AgendamentoRepository } from '../repositories/AgendamentoRepository.js';
import { BarbeiroRepository } from '../repositories/BarbeiroRepository.js';
import { ServicoRepository } from '../repositories/ServicoRepository.js';
import { EmailService } from '../services/EmailService.js';

const agendamentoRepo = new AgendamentoRepository();
const barbeiroRepo = new BarbeiroRepository();
const servicoRepo = new ServicoRepository();
const emailService = new EmailService();

export class AgendamentoController {
  async listar(req, res) {
    try {
      const agendamentos = await agendamentoRepo.listarTodos();
      res.json({ success: true, data: agendamentos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const agendamento = await agendamentoRepo.buscarPorId(id);
      
      if (!agendamento) {
        return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
      }
      
      res.json({ success: true, data: agendamento });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async criar(req, res) {
    try {
      const { clienteNome, clienteEmail, clienteTelefone, barbeiroId, servicoId, data, horario, observacoes } = req.body;

      // Validar barbeiro
      const barbeiro = await barbeiroRepo.buscarPorId(barbeiroId);
      if (!barbeiro || !barbeiro.ativo) {
        return res.status(400).json({ success: false, error: 'Barbeiro não encontrado ou inativo' });
      }

      // Validar serviço
      const servico = await servicoRepo.buscarPorId(servicoId);
      if (!servico || !servico.ativo) {
        return res.status(400).json({ success: false, error: 'Serviço não encontrado ou inativo' });
      }

      // Criar agendamento
      const agendamento = new Agendamento({
        id: randomUUID(),
        clienteNome,
        clienteEmail,
        clienteTelefone,
        barbeiroId: barbeiro.id,
        barbeiroNome: barbeiro.nome,
        servicoId: servico.id,
        servicoNome: servico.nome,
        data: new Date(data),
        horario,
        status: 'pendente',
        preco: servico.preco,
        duracaoMinutos: servico.duracaoMinutos,
        observacoes
      });

      await agendamentoRepo.criar(agendamento);

      // Enviar email
      await emailService.enviarConfirmacao({
        para: clienteEmail,
        nomeCliente: clienteNome,
        data: agendamento.data,
        horario,
        barbeiro: barbeiro.nome,
        servico: servico.nome,
        preco: servico.preco
      });

      res.status(201).json({ success: true, data: agendamento });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async confirmar(req, res) {
    try {
      const { id } = req.params;
      const agendamento = await agendamentoRepo.buscarPorId(id);
      
      if (!agendamento) {
        return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
      }

      agendamento.confirmar();
      await agendamentoRepo.atualizar(agendamento);

      res.json({ success: true, message: 'Agendamento confirmado' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const agendamento = await agendamentoRepo.buscarPorId(id);
      
      if (!agendamento) {
        return res.status(404).json({ success: false, error: 'Agendamento não encontrado' });
      }

      agendamento.cancelar();
      await agendamentoRepo.atualizar(agendamento);

      // Enviar email
      await emailService.enviarCancelamento({
        para: agendamento.clienteEmail,
        nomeCliente: agendamento.clienteNome,
        data: agendamento.data,
        horario: agendamento.horario,
        barbeiro: agendamento.barbeiroNome,
        servico: agendamento.servicoNome
      });

      res.json({ success: true, message: 'Agendamento cancelado' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}