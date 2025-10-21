import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Barbeiro } from '../domain/Barbeiro.js';

const prisma = new PrismaClient();

export class BarbeiroRepository {
  async buscarPorId(id) {
    const data = await prisma.user.findUnique({
      where: { id, role: 'BARBER' }
    });

    if (!data) return null;

    return new Barbeiro({
      id: data.id,
      nome: data.name,
      email: data.email,
      telefone: data.phone || '',
      especialidades: data.specialties || [],
      ativo: data.isActive,
      fotoUrl: data.photoUrl
    });
  }

  async listarTodos() {
    const barbeiros = await prisma.user.findMany({
      where: { role: 'BARBER' }
    });

    return barbeiros.map(data => new Barbeiro({
      id: data.id,
      nome: data.name,
      email: data.email,
      telefone: data.phone || '',
      especialidades: data.specialties || [],
      ativo: data.isActive,
      fotoUrl: data.photoUrl
    }));
  }

  async listarAtivos() {
    const barbeiros = await prisma.user.findMany({
      where: {
        role: 'BARBER',
        isActive: true
      }
    });

    return barbeiros.map(data => new Barbeiro({
      id: data.id,
      nome: data.name,
      email: data.email,
      telefone: data.phone || '',
      especialidades: data.specialties || [],
      ativo: data.isActive,
      fotoUrl: data.photoUrl
    }));
  }

  async criar(barbeiro, senha) {
    const passwordHash = await bcrypt.hash(senha, 10);

    // Buscar primeira unidade disponível
    const unit = await prisma.unit.findFirst();

    await prisma.user.create({
      data: {
        id: barbeiro.id,
        name: barbeiro.nome,
        email: barbeiro.email,
        passwordHash,
        role: 'BARBER',
        phone: barbeiro.telefone,
        specialties: barbeiro.especialidades,
        photoUrl: barbeiro.fotoUrl,
        isActive: barbeiro.ativo,
        unitId: unit.id
      }
    });
  }

  async atualizar(barbeiro) {
    await prisma.user.update({
      where: { id: barbeiro.id },
      data: {
        name: barbeiro.nome,
        email: barbeiro.email,
        phone: barbeiro.telefone,
        specialties: barbeiro.especialidades,
        photoUrl: barbeiro.fotoUrl,
        isActive: barbeiro.ativo
      }
    });
  }
}