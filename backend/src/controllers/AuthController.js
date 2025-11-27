import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
      }

      const resultado = await authService.login(email, senha);

      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async registrar(req, res) {
    try {
      const { nome, email, senha, role, unitId } = req.body;

      if (!nome || !email || !senha || !unitId) {
        return res.status(400).json({
          success: false,
          error: 'Nome, email, senha e unidade são obrigatórios'
        });
      }

      const resultado = await authService.registrar({ nome, email, senha, role, unitId });

      res.status(201).json({
        success: true,
        data: resultado
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async me(req, res) {
    try {
      // req.user foi preenchido pelo middleware de autenticação
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}