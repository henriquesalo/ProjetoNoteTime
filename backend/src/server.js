import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AgendamentoController } from './controllers/AgendamentoController.js';
import { BarbeiroController } from './controllers/BarbeiroController.js';
import { ServicoController } from './controllers/ServicoController.js';
import { AuthController } from './controllers/AuthController.js';
import { authMiddleware, checkRole } from './middlewares/authMiddleware.js';
import { ClienteController } from './controllers/ClienteController.js';

const app = express();

// Controllers
const agendamentoController = new AgendamentoController();
const barbeiroController = new BarbeiroController();
const servicoController = new ServicoController();
const clienteController = new ClienteController();
const authController = new AuthController();

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());

// ROTAS PÚBLICAS 
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de autenticação
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/registrar', (req, res) => authController.registrar(req, res));

// ROTAS COM AUTENTICAÇÃO
// Usuário logado
app.get('/api/auth/me', authMiddleware, (req, res) => authController.me(req, res));

// Agendamentos (qualquer usuário autenticado)
app.get('/api/agendamentos', authMiddleware, (req, res) => agendamentoController.listar(req, res));
app.get('/api/agendamentos/:id', authMiddleware, (req, res) => agendamentoController.buscar(req, res));
app.post('/api/agendamentos', authMiddleware, (req, res) => agendamentoController.criar(req, res));
app.patch('/api/agendamentos/:id/confirmar', authMiddleware, (req, res) => agendamentoController.confirmar(req, res));
app.delete('/api/agendamentos/:id', authMiddleware, (req, res) => agendamentoController.cancelar(req, res));

// Barbeiros (qualquer usuário autenticado pode listar, apenas ADMIN pode criar/editar)
app.get('/api/barbeiros', authMiddleware, (req, res) => barbeiroController.listar(req, res));
app.get('/api/barbeiros/ativos', authMiddleware, (req, res) => barbeiroController.listarAtivos(req, res));
app.get('/api/barbeiros/:id', authMiddleware, (req, res) => barbeiroController.buscar(req, res));
app.post('/api/barbeiros', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => barbeiroController.criar(req, res));
app.put('/api/barbeiros/:id', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => barbeiroController.atualizar(req, res));
app.patch('/api/barbeiros/:id/toggle', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => barbeiroController.toggleAtivo(req, res));

// Serviços (qualquer usuário pode listar, apenas ADMIN pode criar/editar)
app.get('/api/servicos', authMiddleware, (req, res) => servicoController.listar(req, res));
app.get('/api/servicos/ativos', authMiddleware, (req, res) => servicoController.listarAtivos(req, res));
app.get('/api/servicos/:id', authMiddleware, (req, res) => servicoController.buscar(req, res));
app.post('/api/servicos', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => servicoController.criar(req, res));
app.put('/api/servicos/:id', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => servicoController.atualizar(req, res));
app.patch('/api/servicos/:id/toggle', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => servicoController.toggleAtivo(req, res));

// Clientes (listar qualquer usuário autenticado, cadastro apenas ADMIN)
app.get('/api/clientes', authMiddleware, (req, res) => clienteController.listar(req, res));
app.post('/api/clientes', authMiddleware, checkRole('ADMINISTRATOR'), (req, res) => clienteController.criar(req, res));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     🚀 NoteTime API Server           ║
╠═══════════════════════════════════════╣
║  Status: ✅ Online                    ║
║  Port: ${PORT}                        ║
║  URL: http://localhost:${PORT}        ║
║  Docs: http://localhost:${PORT}/health║
╚═══════════════════════════════════════╝
  `);
});