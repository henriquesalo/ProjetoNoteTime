import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export function authMiddleware(req, res, next) {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido'
      });
    }

    // Formato: "Bearer TOKEN"
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token mal formatado'
      });
    }

    // Verificar token
    const decoded = authService.verificarToken(token);
    
    // Adicionar usuário na requisição
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }
}

// Middleware para verificar role específica
export function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
}