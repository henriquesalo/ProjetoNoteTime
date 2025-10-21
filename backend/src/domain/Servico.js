export class Servico {
  constructor({ id, nome, descricao, preco, duracaoMinutos, ativo = true }) {
    if (preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }
    if (duracaoMinutos <= 0) {
      throw new Error('Duração deve ser maior que zero');
    }

    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.duracaoMinutos = duracaoMinutos;
    this.ativo = ativo;
  }

  ativar() {
    this.ativo = true;
  }

  desativar() {
    this.ativo = false;
  }
}