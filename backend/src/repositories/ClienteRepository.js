import { PrismaClient } from '@prisma/client';
import { Cliente } from '../domain/Cliente.js';

const prisma = new PrismaClient();

function mapToDomain(data) {
  if (!data) return null;

  return new Cliente({
    id: data.id,
    nome: data.name,
    email: data.email,
    telefone: data.phone,
    cpf: data.cpf,
    dataNascimento: data.birthDate,
    ativo: data.isActive
  });
}

export class ClienteRepository {
  async listarTodos({ search } = {}) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
            { cpf: { contains: search } }
          ]
        }
      : {};

    const clientes = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return clientes.map(mapToDomain);
  }

  async buscarPorId(id) {
    const cliente = await prisma.client.findUnique({
      where: { id }
    });

    return mapToDomain(cliente);
  }

  async buscarPorTelefone(telefone) {
    const cliente = await prisma.client.findFirst({
      where: { phone: telefone }
    });

    return mapToDomain(cliente);
  }

  async criar(cliente) {
    const data = await prisma.client.create({
      data: {
        id: cliente.id,
        name: cliente.nome,
        email: cliente.email,
        phone: cliente.telefone,
        cpf: cliente.cpf,
        birthDate: cliente.dataNascimento,
        isActive: cliente.ativo
      }
    });

    return mapToDomain(data);
  }

  async atualizar(cliente) {
    const data = await prisma.client.update({
      where: { id: cliente.id },
      data: {
        name: cliente.nome,
        email: cliente.email,
        phone: cliente.telefone,
        cpf: cliente.cpf,
        birthDate: cliente.dataNascimento,
        isActive: cliente.ativo
      }
    });

    return mapToDomain(data);
  }
}

