export class Cliente {
  constructor({ id, nome, email, telefone, cpf = null, dataNascimento = null, ativo = true }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.cpf = cpf;
    this.dataNascimento = dataNascimento;
    this.ativo = ativo;
  }

  ativar() {
    this.ativo = true;
  }

  desativar() {
    this.ativo = false;
  }
}

