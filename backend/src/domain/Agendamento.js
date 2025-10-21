export class Agendamento {
  constructor({
    id,
    clienteNome,
    clienteEmail,
    clienteTelefone,
    barbeiroId,
    barbeiroNome,
    servicoId,
    servicoNome,
    data,
    horario,
    status = 'pendente',
    preco,
    duracaoMinutos,
    observacoes = null
  }) {
    this.id = id;
    this.clienteNome = clienteNome;
    this.clienteEmail = clienteEmail;
    this.clienteTelefone = clienteTelefone;
    this.barbeiroId = barbeiroId;
    this.barbeiroNome = barbeiroNome;
    this.servicoId = servicoId;
    this.servicoNome = servicoNome;
    this.data = data;
    this.horario = horario;
    this.status = status;
    this.preco = preco;
    this.duracaoMinutos = duracaoMinutos;
    this.observacoes = observacoes;
    this.criadoEm = new Date();
  }

  confirmar() {
    if (this.status !== 'pendente') {
      throw new Error('Apenas agendamentos pendentes podem ser confirmados');
    }
    this.status = 'confirmado';
  }

  cancelar() {
    if (!['pendente', 'confirmado'].includes(this.status)) {
      throw new Error('Agendamento não pode ser cancelado');
    }
    this.status = 'cancelado';
  }

  podeSerCancelado() {
    return ['pendente', 'confirmado'].includes(this.status);
  }
}