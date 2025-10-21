export class Barbeiro {
  constructor({ id, nome, email, telefone, especialidades = [], ativo = true, fotoUrl = null }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.especialidades = especialidades;
    this.ativo = ativo;
    this.fotoUrl = fotoUrl;
  }

  ativar() {
    this.ativo = true;
  }

  desativar() {
    this.ativo = false;
  }

  possuiEspecialidade(especialidade) {
    return this.especialidades.includes(especialidade);
  }
}