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
    const { id, role } = req.user;
    let agendamentos;

    // Barbeiro 
    if (role === 'BARBER') {
      agendamentos = await agendamentoRepo.listarPorBarbeiro(id);
    } 
    // Admin
    else {
      agendamentos = await agendamentoRepo.listarTodos();
    }

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
      const {
        clienteNome,
        clienteEmail,
        clienteTelefone,
        barbeiroId,
        servicoId,
        servicosIds = [],
        data,
        horario,
        observacoes
      } = req.body;

      // Validar barbeiro
      const barbeiro = await barbeiroRepo.buscarPorId(barbeiroId);
      if (!barbeiro || !barbeiro.ativo) {
        return res.status(400).json({ success: false, error: 'Barbeiro não encontrado ou inativo' });
      }

      // Validar serviços
      const listaServicosIds = Array.isArray(servicosIds)
        ? servicosIds.filter(Boolean)
        : [];

      if (servicoId && !listaServicosIds.includes(servicoId)) {
        listaServicosIds.push(servicoId);
      }

      if (listaServicosIds.length === 0) {
        return res.status(400).json({ success: false, error: 'Selecione pelo menos um serviço' });
      }

      const servicos = await servicoRepo.buscarPorIds(listaServicosIds);

      if (servicos.length !== listaServicosIds.length) {
        return res.status(400).json({ success: false, error: 'Um ou mais serviços não foram encontrados' });
      }

      const servicosInativos = servicos.filter(servico => !servico.ativo);
      if (servicosInativos.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Os serviços ${servicosInativos.map(s => s.nome).join(', ')} estão inativos`
        });
      }

      // Criar agendamento
      const agendamento = new Agendamento({
        id: randomUUID(),
        clienteNome,
        clienteEmail,
        clienteTelefone,
        barbeiroId: barbeiro.id,
        barbeiroNome: barbeiro.nome,
        servicos,
        data: new Date(data),
        horario,
        status: 'pendente',
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
        servicos: agendamento.servicos,
        precoTotal: agendamento.preco
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
        servicos: agendamento.servicos
      });

      res.json({ success: true, message: 'Agendamento cancelado' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}