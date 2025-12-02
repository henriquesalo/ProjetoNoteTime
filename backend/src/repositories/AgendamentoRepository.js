import { PrismaClient } from '@prisma/client';
import { Agendamento } from '../domain/Agendamento.js';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function mapServicos(data) {
  const relacoes = data.services?.length ? data.services : [];

  if (relacoes.length > 0) {
    return relacoes.map((item) => ({
      id: item.service.id,
      nome: item.service.name,
      preco: Number(item.price ?? item.service.price),
      duracaoMinutos: item.durationMinutes ?? item.service.durationMinutes
    }));
  }

  if (data.service) {
    return [{
      id: data.service.id,
      nome: data.service.name,
      preco: Number(data.service.price),
      duracaoMinutos: data.service.durationMinutes
    }];
  }

  return [];
}

export class AgendamentoRepository {
  async buscarPorId(id) {
    const data = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        barber: true,
        service: true,
        services: {
          include: { service: true }
        }
      }
    });

    if (!data) return null;

    const servicos = mapServicos(data);

    return new Agendamento({
      id: data.id,
      clienteNome: data.client.name,
      clienteEmail: data.client.email || '',
      clienteTelefone: data.client.phone,
      barbeiroId: data.barber.id,
      barbeiroNome: data.barber.name,
      servicos,
      servicoId: servicos[0]?.id || data.service?.id || null,
      servicoNome: servicos.length ? undefined : data.service?.name,
      data: data.scheduledDate,
      horario: this.extrairHorario(data.scheduledDate),
      status: data.status.toLowerCase(),
      preco: servicos.length ? undefined : Number(data.service?.price || 0),
      duracaoMinutos: servicos.length ? undefined : data.service?.durationMinutes,
      observacoes: data.observations
    });
  }

  async listar(filtros = {}) {
    const where = this.construirFiltros(filtros);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        barber: true,
        service: true,
        services: {
          include: { service: true }
        }
      },
      orderBy: { scheduledDate: 'desc' }
    });

    return appointments.map(data => {
      const servicos = mapServicos(data);

      return new Agendamento({
        id: data.id,
        clienteNome: data.client.name,
        clienteEmail: data.client.email || '',
        clienteTelefone: data.client.phone,
        barbeiroId: data.barber.id,
        barbeiroNome: data.barber.name,
        servicos,
        servicoId: servicos[0]?.id || data.service?.id || null,
        servicoNome: servicos.length ? undefined : data.service?.name,
        data: data.scheduledDate,
        horario: this.extrairHorario(data.scheduledDate),
        status: data.status.toLowerCase(),
        preco: servicos.length ? undefined : Number(data.service?.price || 0),
        duracaoMinutos: servicos.length ? undefined : data.service?.durationMinutes,
        observacoes: data.observations
      });
    });
  }

  async criar(agendamento) {
    if (!agendamento.servicos || agendamento.servicos.length === 0) {
      throw new Error('Agendamento precisa conter pelo menos um serviço');
    }

    // Buscar ou criar cliente
    let client = await prisma.client.findFirst({
      where: { phone: agendamento.clienteTelefone }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          id: randomUUID(),
          name: agendamento.clienteNome,
          email: agendamento.clienteEmail,
          phone: agendamento.clienteTelefone
        }
      });
    }

    const barber = await prisma.user.findUnique({
      where: { id: agendamento.barbeiroId }
    });

    await prisma.appointment.create({
      data: {
        id: agendamento.id,
        clientId: client.id,
        barberId: agendamento.barbeiroId,
        serviceId: agendamento.servicos[0].id,
        unitId: barber.unitId,
        scheduledDate: this.combinarDataHora(agendamento.data, agendamento.horario),
        status: agendamento.status.toUpperCase(),
        observations: agendamento.observacoes,
        createdBy: agendamento.barbeiroId,
        services: {
          create: agendamento.servicos.map((servico) => ({
            serviceId: servico.id,
            price: servico.preco,
            durationMinutes: servico.duracaoMinutos
          }))
        }
      }
    });
  }

  async atualizar(agendamento) {
    await prisma.appointment.update({
      where: { id: agendamento.id },
      data: {
        status: agendamento.status.toUpperCase(),
        observations: agendamento.observacoes
      }
    });
  }

  construirFiltros(filtros) {
    const where = {};

    if (filtros.status) {
      // O status vem em minúsculo do frontend, mas o enum do Prisma é em maiúsculo
      where.status = filtros.status.toUpperCase();
    }

    if (filtros.dataInicial || filtros.dataFinal) {
      where.scheduledDate = {};

      if (filtros.dataInicial) {
        // Filtra agendamentos a partir da data inicial (inclusivo)
        where.scheduledDate.gte = new Date(filtros.dataInicial);
      }

      if (filtros.dataFinal) {
        // Filtra agendamentos até o final do dia da data final (inclusivo)
        const dataFinal = new Date(filtros.dataFinal);
        dataFinal.setHours(23, 59, 59, 999);
        where.scheduledDate.lte = dataFinal;
      }
    }

    if (filtros.clienteNome) {
      where.client = {
        name: {
          contains: filtros.clienteNome,
          mode: 'insensitive'
        }
      };
    }

    return where;
  }

  extrairHorario(date) {
    return date.toISOString().substring(11, 16);
  }

  combinarDataHora(data, horario) {
    const [horas, minutos] = horario.split(':');
    const combined = new Date(data);
    combined.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    return combined;
  }
  async listarPorBarbeiro(barbeiroId, filtros = {}) {
    const where = this.construirFiltros(filtros);

    const appointments = await prisma.appointment.findMany({
      where: { ...where, barberId },
      include: {
        client: true,
        barber: true,
        service: true,
        services: { include: { service: true } }
      },
      orderBy: { scheduledDate: 'desc' }
    });

    return appointments.map(data => {
      const servicos = mapServicos(data);

      return new Agendamento({
        id: data.id,
        clienteNome: data.client.name,
        clienteEmail: data.client.email || '',
        clienteTelefone: data.client.phone,
        barbeiroId: data.barber.id,
        barbeiroNome: data.barber.name,
        servicos,
        servicoId: servicos[0]?.id || data.service?.id || null,
        servicoNome: servicos.length ? undefined : data.service?.name,
        data: data.scheduledDate,
        horario: this.extrairHorario(data.scheduledDate),
        status: data.status.toLowerCase(),
        preco: servicos.length ? undefined : Number(data.service?.price || 0),
        duracaoMinutos: servicos.length ? undefined : data.service?.durationMinutes,
        observacoes: data.observations
      });
    });
  }
}