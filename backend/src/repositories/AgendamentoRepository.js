import { PrismaClient } from '@prisma/client';
import { Agendamento } from '../domain/Agendamento.js';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export class AgendamentoRepository {
  async buscarPorId(id) {
    const data = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        barber: true,
        service: true
      }
    });

    if (!data) return null;

    return new Agendamento({
      id: data.id,
      clienteNome: data.client.name,
      clienteEmail: data.client.email || '',
      clienteTelefone: data.client.phone,
      barbeiroId: data.barber.id,
      barbeiroNome: data.barber.name,
      servicoId: data.service.id,
      servicoNome: data.service.name,
      data: data.scheduledDate,
      horario: this.extrairHorario(data.scheduledDate),
      status: data.status.toLowerCase(),
      preco: Number(data.service.price),
      duracaoMinutos: data.service.durationMinutes,
      observacoes: data.observations
    });
  }

  async listarTodos() {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        barber: true,
        service: true
      },
      orderBy: { scheduledDate: 'desc' }
    });

    return appointments.map(data => new Agendamento({
      id: data.id,
      clienteNome: data.client.name,
      clienteEmail: data.client.email || '',
      clienteTelefone: data.client.phone,
      barbeiroId: data.barber.id,
      barbeiroNome: data.barber.name,
      servicoId: data.service.id,
      servicoNome: data.service.name,
      data: data.scheduledDate,
      horario: this.extrairHorario(data.scheduledDate),
      status: data.status.toLowerCase(),
      preco: Number(data.service.price),
      duracaoMinutos: data.service.durationMinutes,
      observacoes: data.observations
    }));
  }

  async criar(agendamento) {
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
        serviceId: agendamento.servicoId,
        unitId: barber.unitId,
        scheduledDate: this.combinarDataHora(agendamento.data, agendamento.horario),
        status: agendamento.status.toUpperCase(),
        observations: agendamento.observacoes,
        createdBy: agendamento.barbeiroId
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

  extrairHorario(date) {
    return date.toISOString().substring(11, 16);
  }

  combinarDataHora(data, horario) {
    const [horas, minutos] = horario.split(':');
    const combined = new Date(data);
    combined.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    return combined;
  }
  async listarPorBarbeiro(barbeiroId) {
    return await prisma.appointment.findMany({
      where: {
        barberId
      },
      include: {
        client: true,
        barber: true,
        service: true
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });
  }
}