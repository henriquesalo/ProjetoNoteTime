export class Agendamento {
  constructor({
    id,
    clienteNome,
    clienteEmail,
    clienteTelefone,
    barbeiroId,
    barbeiroNome,
    servicoId = null,
    servicoNome = '',
    servicos = [],
    data,
    horario,
    status = 'scheduled',
    preco,
    precoTotal = null,
    duracaoMinutos,
    duracaoTotal = null,
    observacoes = null
  }) {
    this.id = id;
    this.clienteNome = clienteNome;
    this.clienteEmail = clienteEmail;
    this.clienteTelefone = clienteTelefone;
    this.barbeiroId = barbeiroId;
    this.barbeiroNome = barbeiroNome;
    this.servicos = (servicos || []).map((servico) => ({
      id: servico.id,
      nome: servico.nome,
      preco: Number(servico.preco ?? 0),
      duracaoMinutos: servico.duracaoMinutos ?? servico.durationMinutes ?? 0
    }));
    this.servicoId = servicoId || this.servicos[0]?.id || null;
    const nomesServicos = this.servicos.length
      ? this.servicos.map((s) => s.nome).join(' + ')
      : servicoNome || '';
    this.servicoNome = nomesServicos;
    this.servicosDescricao = nomesServicos;
    this.data = data;
    this.horario = horario;
    this.status = status;
    const totalPreco = precoTotal ?? (this.servicos.length
      ? this.servicos.reduce((sum, s) => sum + (s.preco || 0), 0)
      : preco || 0);
    this.preco = totalPreco;
    this.precoTotal = totalPreco;
    const totalDuracao = duracaoTotal ?? (this.servicos.length
      ? this.servicos.reduce((sum, s) => sum + (s.duracaoMinutos || 0), 0)
      : duracaoMinutos || 0);
    this.duracaoMinutos = totalDuracao;
    this.duracaoTotal = totalDuracao;
    this.observacoes = observacoes;
    this.criadoEm = new Date();
  }

  confirmar() {
    this.alterarStatus('confirmed');
  }

  cancelar() {
    this.alterarStatus('cancelled');
  }

  alterarStatus(novoStatus) {
    const statusValidos = [
      'scheduled',
      'confirmed',
      'present',
      'absent',
      'cancelled',
      'completed'
    ];

    if (!statusValidos.includes(novoStatus.toLowerCase())) {
      throw new Error(`Status inválido: ${novoStatus}`);
    }

    // Lógica de transição de status mais rigorosa pode ser adicionada aqui se necessário.
    // Por enquanto, permitiremos a alteração direta, exceto para cancelamento e confirmação que já existem.
    
    this.status = novoStatus.toLowerCase();
  }

  podeSerCancelado() {
    return ['scheduled', 'confirmed'].includes(this.status);
  }
}