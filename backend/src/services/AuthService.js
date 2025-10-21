import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-muito-seguro-mude-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

export class AuthService {
  async login(email, senha) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { unit: true }
    });

    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    if (!user.isActive) {
      throw new Error('Usuário inativo');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.passwordHash);
    if (!senhaValida) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nome: user.name,
        role: user.role,
        unitId: user.unitId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Retornar dados do usuário (sem senha!)
    return {
      token,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
        role: user.role,
        unidade: user.unit.name
      }
    };
  }

  async registrar(dados) {
    const { nome, email, senha, role = 'BARBER', unitId } = dados;

    // Verificar se email já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: nome,
        email,
        passwordHash,
        role,
        unitId,
        isActive: true
      }
    });

    // Gerar token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nome: user.name,
        role: user.role,
        unitId: user.unitId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
}