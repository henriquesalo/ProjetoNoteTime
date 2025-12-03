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
    return [
      {
        id: data.service.id,
        nome: data.service.name,
        preco: Number(data.service.price),
        duracaoMinutos: data.service.durationMinutes
      }
    ];
  }

  return [];
}

export class AgendamentoRepository {
  extrairHorario(date) {
    return date.toISOString().substring(11, 16);
  }

  combinarDataHora(data, horario) {
    const [horas, minutos] = horario.split(':');
    const dataObj = this.parseDataFlex(data);
    dataObj.setHours(Number(horas), Number(minutos), 0, 0);
    return dataObj;
  }

  parseDataFlex(data) {
    if (data instanceof Date) return new Date(data);
    if (typeof data !== 'string') return new Date(data);
    const iso = new Date(data);
    if (!isNaN(iso.getTime())) return iso;
    const m = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    }
    return new Date(data);
  }

  calcularDuracaoTotal(servicos) {
    return (servicos || []).reduce((sum, s) => sum + Number(s.duracaoMinutos || 0), 0);
  }

  addMinutes(date, minutes) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + Number(minutes || 0));
    return d;
  }

  async verificarConflitoHorario(barbeiroId, inicio, duracaoMinutos) {
    const diaInicio = new Date(inicio);
    diaInicio.setHours(0, 0, 0, 0);
    const diaFim = new Date(inicio);
    diaFim.setHours(23, 59, 59, 999);
    const existentes = await prisma.appointment.findMany({
      where: {
        barberId: barbeiroId,
        scheduledDate: { gte: diaInicio, lte: diaFim },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'PRESENT'] }
      },
      include: {
        service: true,
        services: { include: { service: true } }
      }
    });
    const novoFim = this.addMinutes(inicio, duracaoMinutos);
    for (const a of existentes) {
      const rel = a.services?.length ? a.services : [];
      const dur = rel.length
        ? rel.reduce((sum, x) => sum + Number(x.durationMinutes ?? x.service.durationMinutes ?? 0), 0)
        : Number(a.service?.durationMinutes || 0);
      const ini = new Date(a.scheduledDate);
      const fim = this.addMinutes(ini, dur);
      if (inicio < fim && novoFim > ini) {
        return true;
      }
    }
    return false;
  }

  mapOne(data) {
    if (!data) {
      return null;
    }

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

    return this.mapMany(appointments);
  }

  async buscarPorId(id) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        barber: true,
        service: true,
        services: { include: { service: true } }
      }
    });

    return this.mapOne(appointment);
  }

  async criar(agendamento) {
    if (!agendamento.servicos || agendamento.servicos.length === 0) {
      throw new Error('Agendamento precisa conter pelo menos um serviço');
    }

    const numsTelefone = agendamento.clienteTelefone?.replace(/\D/g, '') || '';
    const telefoneNormalizado = numsTelefone;

    let client = await prisma.client.findFirst({
      where: {
        OR: [
          telefoneNormalizado ? { phone: telefoneNormalizado } : null,
          agendamento.clienteNome ? { name: agendamento.clienteNome } : null
        ].filter(Boolean)
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          id: randomUUID(),
          name: agendamento.clienteNome,
          email: agendamento.clienteEmail,
          phone: telefoneNormalizado || null
        }
      });
    } else {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: agendamento.clienteNome,
          email: agendamento.clienteEmail,
          phone: telefoneNormalizado || client.phone
        }
      });
    }

    const barber = await prisma.user.findUnique({
      where: { id: agendamento.barbeiroId }
    });

    if (!barber) {
      throw new Error('Barbeiro não encontrado');
    }
    if (!barber.isActive) {
      throw new Error('Barbeiro inativo');
    }
    if (!barber.unitId) {
      throw new Error('Nenhuma unidade configurada para o barbeiro');
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(agendamento.horario))) {
      throw new Error('Horário inválido');
    }

    const scheduledDate = this.combinarDataHora(agendamento.data, agendamento.horario);
    const duracaoTotal = this.calcularDuracaoTotal(agendamento.servicos);
    const haConflito = await this.verificarConflitoHorario(agendamento.barbeiroId, scheduledDate, duracaoTotal);
    if (haConflito) {
      throw new Error('Horário indisponível para este barbeiro');
    }

    const created = await prisma.appointment.create({
      data: {
        id: agendamento.id || randomUUID(),
        clientId: client.id,
        barberId: agendamento.barbeiroId,
        serviceId: agendamento.servicos[0].id,
        unitId: barber.unitId,
        scheduledDate,
        status: agendamento.status.toUpperCase(),
        observations: agendamento.observacoes,
        createdBy: agendamento.usuarioId || agendamento.barbeiroId,
        services: {
          create: agendamento.servicos.map((servico) => ({
            serviceId: servico.id,
            price: servico.preco,
            durationMinutes: servico.duracaoMinutos
          }))
        }
      },
      include: {
        client: true,
        barber: true,
        service: true,
        services: {
          include: { service: true }
        }
      }
    });

    return this.mapOne(created);
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

  mapMany(list) {
    return (list || []).map((data) => this.mapOne(data));
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

    if (filtros.barbeiroId) {
      where.barberId = filtros.barbeiroId;
    }

    return where;
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
