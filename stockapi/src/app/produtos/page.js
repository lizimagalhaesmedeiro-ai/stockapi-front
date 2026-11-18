import { useEffect, useState } from "react";
import "./produtos.css";

const API = "https://stock.dev.vilhena.ifro.edu.br/api";

function Produtos() {
  // Estados da página
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Controle do formulário
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  // Dados do formulário
  const [formulario, setFormulario] = useState({
    nome: "",
    descricao: "",
    preco: "",
    quantidade_estoque: "0",
    categoria_id: ""
  });

  // Função para buscar os dados da API
  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [respostaProdutos, respostaCategorias] =
        await Promise.all([
          fetch(`${API}/produtos`),
          fetch(`${API}/categorias`)
        ]);

      if (!respostaProdutos.ok || !respostaCategorias.ok) {
        throw new Error("Erro ao buscar informações da API.");
      }

      const dadosProdutos = await respostaProdutos.json();
      const dadosCategorias = await respostaCategorias.json();

      setProdutos(dadosProdutos);
      setCategorias(dadosCategorias);

    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  // Carrega os dados quando a página abre
  useEffect(() => {
    carregarDados();
  }, []);

  // Atualiza os campos do formulário
  function atualizarFormulario(evento) {
    const { name, value } = evento.target;

    setFormulario({
      ...formulario,
      [name]: value
    });
  }

  // Limpa o formulário
  function limparFormulario() {
    setFormulario({
      nome: "",
      descricao: "",
      preco: "",
      quantidade_estoque: "0",
      categoria_id: ""
    });

    setProdutoEditando(null);
    setMostrarFormulario(false);
  }

  // Abre o formulário para cadastrar
  function novoProduto() {
    limparFormulario();
    setMostrarFormulario(true);
  }

  // Abre o formulário para editar
  function editarProduto(produto) {
    setProdutoEditando(produto);

    setFormulario({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      preco: produto.preco,
      quantidade_estoque: produto.quantidade_estoque ?? 0,
      categoria_id: produto.categoria_id ?? ""
    });

    setMostrarFormulario(true);
  }

  // Salva um produto novo ou atualizado
  async function salvarProduto(evento) {
    evento.preventDefault();

    const dados = {
      nome: formulario.nome.trim(),
      descricao: formulario.descricao,
      preco: Number(formulario.preco),
      quantidade_estoque: Number(formulario.quantidade_estoque),
      categoria_id: formulario.categoria_id
        ? Number(formulario.categoria_id)
        : null
    };

    if (!dados.nome || dados.preco <= 0) {
      alert("Informe um nome e um preço maior que zero.");
      return;
    }

    if (
      !Number.isInteger(dados.quantidade_estoque) ||
      dados.quantidade_estoque < 0
    ) {
      alert("Informe uma quantidade inteira igual ou maior que zero.");
      return;
    }

    try {
      const editando = produtoEditando !== null;

      const resposta = await fetch(
        editando
          ? `API/produtos/{produtoEditando.id}`
          : `${API}/produtos`,
        {
          method: editando ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        }
      );

      if (!resposta.ok) {
        const resultado = await resposta.json();
        throw new Error(
          resultado.erro || "Não foi possível salvar o produto."
        );
      }

      limparFormulario();

      setMensagem(
        editando
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!"
      );

      await carregarDados();

    } catch (error) {
      alert(error.message);
    }
  }

  // Exclui um produto
  async function excluirProduto(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) return;

    try {
      const resposta = await fetch(`API/produtos/{id}`, {
        method: "DELETE"
      });

      if (!resposta.ok) {
        const resultado = await resposta.json();
        throw new Error(
          resultado.erro || "Não foi possível excluir o produto."
        );
      }

      setMensagem("Produto excluído com sucesso!");

      await carregarDados();

    } catch (error) {
      alert(error.message);
    }
  }

  // Pesquisa produtos pelo nome
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // Formata o preço
  function formatarPreco(preco) {
    return Number(preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  // Encontra o nome da categoria
  function nomeCategoria(id) {
    const categoria = categorias.find(
      (item) => item.id === id
    );

    return categoria ? categoria.nome : "Sem categoria";
  }

  return (
    <main className="produtos-container">

      {/* Cabeçalho da página */}
      <section className="produtos-banner">
        <h1>Gerenciamento de Produtos</h1>

        <p>
          Cadastre, consulte e organize os produtos do estoque.
        </p>
      </section>

      {/* Conteúdo principal */}
      <section className="produtos-conteudo">

        <div className="produtos-titulo">
          <h2>Produtos em Estoque</h2>

          <p>
            Visualize e gerencie os produtos cadastrados no sistema.
          </p>
        </div>

        {/* Resumo dos produtos */}
        <div className="resumo-produtos">

          <div className="card-produto">
            <span>TOTAL DE PRODUTOS</span>
            <strong>{produtos.length}</strong>
          </div>

          <div className="card-produto">
            <span>CATEGORIAS</span>
            <strong>{categorias.length}</strong>
          </div>

          <div className="card-produto">
            <span>RESULTADOS</span>
            <strong>{produtosFiltrados.length}</strong>
          </div>

        </div>

        {/* Pesquisa e cadastro */}
        <div className="produtos-acoes">

          <input
            type="text"
            placeholder="Pesquisar produto pelo nome..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />

          <button
            className="botao-novo"
            onClick={novoProduto}
          >
            + Novo Produto
          </button>

        </div>

        {/* Mensagens */}
        {mensagem && (
          <div className="mensagem-sucesso">
            {mensagem}
            <button
              type="button"
              onClick={() => setMensagem("")}
            >
              ×
            </button>
          </div>
        )}

        {erro && (
          <div className="mensagem-erro">
            {erro}
            <button
              type="button"
              onClick={carregarDados}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Formulário */}
        {mostrarFormulario && (
          <form
            className="produto-formulario"
            onSubmit={salvarProduto}
          >

            <h3>
              {produtoEditando
                ? "Editar Produto"
                : "Cadastrar Novo Produto"}
            </h3>

            <div className="campo-formulario">
              <label>Nome do produto *</label>

              <input
                type="text"
                name="nome"
                placeholder="Digite o nome do produto"
                value={formulario.nome}
                onChange={atualizarFormulario}
                maxLength={100}
                required
              />
            </div>

            <div className="campo-formulario">
              <label>Descrição</label>

              <textarea
                name="descricao"
                placeholder="Descreva o produto..."
                value={formulario.descricao}
                onChange={atualizarFormulario}
              />
            </div>

            <div className="formulario-linha">

              <div className="campo-formulario">
                <label>Preço (R$) *</label>

                <input
                  type="number"
                  name="preco"
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
                  value={formulario.preco}
                  onChange={atualizarFormulario}
                  required
                />
              </div>

              <div className="campo-formulario">
                <label>Quantidade em estoque</label>

                <input
                  type="number"
                  name="quantidade_estoque"
                  min="0"
                  step="1"
                  value={formulario.quantidade_estoque}
                  onChange={atualizarFormulario}
                />
              </div>

            </div>

            <div className="campo-formulario">
              <label>Categoria</label>

              <select
                name="categoria_id"
                value={formulario.categoria_id}
                onChange={atualizarFormulario}
              >
                <option value="">Sem categoria</option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="formulario-botoes">

              <button
                type="submit"
                className="botao-salvar"
              >
                Salvar Produto
              </button>

              <button
                type="button"
                className="botao-cancelar"
                onClick={limparFormulario}
              >
                Cancelar
              </button>

            </div>

          </form>
        )}

        {/* Tabela de produtos */}
        <div className="tabela-titulo">
          <h2>Lista de Produtos</h2>
        </div>

        {carregando ? (
          <p className="mensagem-vazia">
            Carregando produtos...
          </p>
        ) : produtosFiltrados.length === 0 ? (
          <p className="mensagem-vazia">
            Nenhum produto encontrado.
          </p>
        ) : (

          <div className="tabela-responsiva">

            <table className="tabela-produtos">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Preço Unitário</th>
                  <th>Quantidade</th>
                  <th>Categoria</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>

                {produtosFiltrados.map((produto) => (

                  <tr key={produto.id}>

                    <td>{produto.id}</td>

                    <td className="nome-produto">
                      {produto.nome}
                    </td>

                    <td>
                      {formatarPreco(produto.preco)}
                    </td>

                    <td>
                      {produto.quantidade_estoque ?? 0} un.
                    </td>

                    <td>
                      {nomeCategoria(produto.categoria_id)}
                    </td>

                    <td>
                      <div className="acoes-tabela">

                        <button
                          className="botao-editar"
                          onClick={() => editarProduto(produto)}
                        >
                          Editar
                        </button>

                        <button
                          className="botao-excluir"
                          onClick={() => excluirProduto(produto.id)}
                        >
                          Excluir
                        </button>

                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default Produtos;

