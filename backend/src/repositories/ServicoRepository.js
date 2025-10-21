import { PrismaClient } from '@prisma/client';
import { Servico } from '../domain/Servico.js';

const prisma = new PrismaClient();

export class ServicoRepository {
  async buscarPorId(id) {
    const data = await prisma.service.findUnique({
      where: { id }
    });

    if (!data) return null;

    return new Servico({
      id: data.id,
      nome: data.name,
      descricao: data.description || '',
      preco: Number(data.price),
      duracaoMinutos: data.durationMinutes,
      ativo: data.isActive
    });
  }

  async listarTodos() {
    const servicos = await prisma.service.findMany();

    return servicos.map(data => new Servico({
      id: data.id,
      nome: data.name,
      descricao: data.description || '',
      preco: Number(data.price),
      duracaoMinutos: data.durationMinutes,
      ativo: data.isActive
    }));
  }

  async listarAtivos() {
    const servicos = await prisma.service.findMany({
      where: { isActive: true }
    });

    return servicos.map(data => new Servico({
      id: data.id,
      nome: data.name,
      descricao: data.description || '',
      preco: Number(data.price),
      duracaoMinutos: data.durationMinutes,
      ativo: data.isActive
    }));
  }

  async criar(servico) {
    // Buscar primeira unidade
    const unit = await prisma.unit.findFirst();

    await prisma.service.create({
      data: {
        id: servico.id,
        name: servico.nome,
        description: servico.descricao,
        price: servico.preco,
        durationMinutes: servico.duracaoMinutos,
        isActive: servico.ativo,
        unitId: unit.id
      }
    });
  }

  async atualizar(servico) {
    await prisma.service.update({
      where: { id: servico.id },
      data: {
        name: servico.nome,
        description: servico.descricao,
        price: servico.preco,
        durationMinutes: servico.duracaoMinutos,
        isActive: servico.ativo
      }
    });
  }
}