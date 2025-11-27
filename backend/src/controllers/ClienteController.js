import { randomUUID } from 'crypto';
import { Cliente } from '../domain/Cliente.js';
import { ClienteRepository } from '../repositories/ClienteRepository.js';

const clienteRepo = new ClienteRepository();

export class ClienteController {
  async listar(req, res) {
    try {
      const { search } = req.query;
      const clientes = await clienteRepo.listarTodos({ search });

      res.json({ success: true, data: clientes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async criar(req, res) {
    try {
      const { nome, email, telefone, cpf, dataNascimento } = req.body;

      if (!nome || !telefone) {
        return res.status(400).json({
          success: false,
          error: 'Nome e telefone são obrigatórios'
        });
      }

      const jaExiste = await clienteRepo.buscarPorTelefone(telefone);
      if (jaExiste) {
        return res.status(409).json({
          success: false,
          error: 'Já existe um cliente cadastrado com este telefone'
        });
      }

      const cliente = new Cliente({
        id: randomUUID(),
        nome,
        email: email || null,
        telefone,
        cpf: cpf || null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        ativo: true
      });

      const criado = await clienteRepo.criar(cliente);

      res.status(201).json({ success: true, data: criado });
    } catch (error) {
      const status = error.code === 'P2002' ? 409 : 400;
      res.status(status).json({ success: false, error: error.message });
    }
  }
}

