import nodemailer from 'nodemailer';

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async enviarConfirmacao({ para, nomeCliente, data, horario, barbeiro, servicos = [], precoTotal }) {
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    const listaServicos = servicos.length
      ? `<ul style="padding-left: 16px; margin: 8px 0;">
          ${servicos.map(servico => {
            const preco = Number(servico.preco ?? 0).toFixed(2);
            const duracao = servico.duracaoMinutos ?? 0;
            return `<li>${servico.nome} - ${duracao} min - R$ ${preco}</li>`;
          }).join('')}
        </ul>`
      : '<p>Serviço selecionado no sistema.</p>';
    const valorTotal = typeof precoTotal === 'number'
      ? `<p><strong>💰 Valor total:</strong> R$ ${precoTotal.toFixed(2)}</p>`
      : '';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d97706;">Agendamento Confirmado!</h1>
        <p>Olá <strong>${nomeCliente}</strong>,</p>
        <p>Seu agendamento foi confirmado com sucesso!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalhes do Agendamento:</h3>
          <p><strong>📅 Data:</strong> ${dataFormatada}</p>
          <p><strong>🕐 Horário:</strong> ${horario}</p>
          <p><strong>💈 Barbeiro:</strong> ${barbeiro}</p>
          <div>
            <p><strong>✂️ Serviços:</strong></p>
            ${listaServicos}
          </div>
          ${valorTotal}
        </div>
        
        <p>Aguardamos você!</p>
        <p style="color: #6b7280; font-size: 14px;">NoteTime - Sistema de Agendamento</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'NoteTime <noreply@notetime.com>',
      to: para,
      subject: '✅ Agendamento Confirmado - NoteTime',
      html
    });
  }

  async enviarCancelamento({ para, nomeCliente, data, horario, barbeiro, servicos = [] }) {
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    const listaServicos = servicos.length
      ? `<ul style="padding-left: 16px; margin: 8px 0;">
          ${servicos.map(servico => `<li>${servico.nome}</li>`).join('')}
        </ul>`
      : '<p>Serviço selecionado no sistema.</p>';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Agendamento Cancelado</h1>
        <p>Olá <strong>${nomeCliente}</strong>,</p>
        <p>Seu agendamento foi cancelado:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📅 Data:</strong> ${dataFormatada}</p>
          <p><strong>🕐 Horário:</strong> ${horario}</p>
          <p><strong>💈 Barbeiro:</strong> ${barbeiro}</p>
          <div>
            <p><strong>✂️ Serviços:</strong></p>
            ${listaServicos}
          </div>
        </div>
        
        <p>Esperamos vê-lo em breve!</p>
        <p style="color: #6b7280; font-size: 14px;">NoteTime - Sistema de Agendamento</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'NoteTime <noreply@notetime.com>',
      to: para,
      subject: '❌ Agendamento Cancelado - NoteTime',
      html
    });
  }
}