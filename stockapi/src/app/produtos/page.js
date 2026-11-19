"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./produtos.module.css";

const API = "https://stock.dev.vilhena.ifro.edu.br/api";

const formularioInicial = {
  nome: "",
  preco: "",
  descricao: "",
  quantidade_estoque: "",
  categoria_id: ""
};
//testeeee

function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.data)) return dados.data;
  return [];
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(formularioInicial);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [resProdutos, resCategorias] = await Promise.all([
        fetch(`${API}/produtos`),
        fetch(`${API}/categorias`)
      ]);

      if (!resProdutos.ok || !resCategorias.ok) {
        throw new Error("Não foi possível carregar os dados.");
      }

      const dadosProdutos = await resProdutos.json();
      const dadosCategorias = await resCategorias.json();

      setProdutos(extrairLista(dadosProdutos));
      setCategorias(extrairLista(dadosCategorias));
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function alterarCampo(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function abrirCadastro() {
    setErro("");
    setEditando(null);
    setForm(formularioInicial);
    setMostrarForm(true);
  }

  function abrirEdicao(produto) {
    setErro("");
    setEditando(produto.id);
    setForm({
      nome: produto.nome || "",
      preco: produto.preco ?? "",
      descricao: produto.descricao || "",
      quantidade_estoque: produto.quantidade_estoque ?? "",
      categoria_id: produto.categoria_id ?? ""
    });
    setMostrarForm(true);
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setErro("");

    const dados = {
      ...form,
      preco: Number(String(form.preco).replace(",", ".")),
      quantidade_estoque: Number(form.quantidade_estoque || 0),
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null
    };

    try {
      const resposta = await fetch(
        editando ? `${API}/produtos/${editando}` : `${API}/produtos`,
        {
          method: editando ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        }
      );

      if (!resposta.ok) {
        const resultado = await resposta.json().catch(() => ({}));
        throw new Error(
          resultado.erro || `Erro ao salvar produto (${resposta.status}).`
        );
      }

      setMostrarForm(false);
      setForm(formularioInicial);
      setEditando(null);
      carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function excluirProduto(id) {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;
    setErro("");

    try {
      const resposta = await fetch(`${API}/produtos/${id}`, {
        method: "DELETE"
      });

      if (!resposta.ok) {
        throw new Error(`Não foi possível excluir o produto (${resposta.status}).`);
      }
      carregarDados();
    } catch (error) {
      setErro(error.message);
    }
  }

  const produtosFiltrados = produtos.filter((produto) =>
    (produto.nome || "").toLowerCase().includes(busca.toLowerCase())
  );

  function nomeCategoria(id) {
    const categoria = categorias.find((item) => Number(item.id) === Number(id));
    return categoria ? categoria.nome : "Sem categoria";
  }

  const totalEstoque = produtos.reduce(
    (total, item) => total + Number(item.quantidade_estoque || 0),
    0
  );

  return (
    <>
    <header className={styles["menu-header"]}>
      <nav className={styles["menu-nav"]}>
        <Link href="/" className={styles["menu-titulo"]}>
          Painel de controle da Stockapi
        </Link>

        <ul className={styles["menu-links"]}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/categorias">Categorias</Link></li>
          <li><Link href="/produtos">Produtos</Link></li>
          <li><Link href="/clientes">Clientes</Link></li>
          <li className={styles["menu-dropdown"]}>
            <Link href="/pedidos">Pedidos <small>▾</small></Link>
            <ul className={styles["menu-submenu"]}>
              <li><Link href="/pedidos">Pedidos</Link></li>
              <li><Link href="/criarPedido">Criar pedido</Link></li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>

    <main className={styles["products-page"]}>
      <section className={styles["products-heading"]}>
        <div>
          <span className={styles["products-subtitle"]}>GERENCIAMENTO DE ESTOQUE</span>
          <h1>Produtos</h1>
          <p>Consulte e organize os produtos cadastrados.</p>
        </div>

        <button className={styles["product-add"]} onClick={abrirCadastro}>
          + Novo produto
        </button>
      </section>

      <section className={styles["products-summary"]}>
        <div className={styles["summary-card"]}>
          <span>Total de produtos</span>
          <strong>{produtos.length}</strong>
        </div>
        <div className={styles["summary-card"]}>
          <span>Itens em estoque</span>
          <strong>{totalEstoque}</strong>
        </div>
        <div className={styles["summary-card"]}>
          <span>Categorias</span>
          <strong>{categorias.length}</strong>
        </div>
      </section>

      {mostrarForm && (
        <form className={styles["product-form"]} onSubmit={salvarProduto}>
          <h2>{editando ? "Editar produto" : "Cadastrar produto"}</h2>

          <div className={styles["form-grid"]}>
            <label>
              Nome do produto
              <input
                name="nome"
                value={form.nome}
                onChange={alterarCampo}
                required
                maxLength={100}
                placeholder="Digite o nome"
              />
            </label>

            <label>
              Preço (R$)
              <input
                name="preco"
                type="number"
                min="0.01"
                step="0.01"
                value={form.preco}
                onChange={alterarCampo}
                required
                placeholder="0,00"
              />
            </label>

            <label>
              Quantidade em estoque
              <input
                name="quantidade_estoque"
                type="number"
                min="0"
                step="1"
                value={form.quantidade_estoque}
                onChange={alterarCampo}
                placeholder="0"
              />
            </label>

            <label>
              Categoria
              <select
                name="categoria_id"
                value={form.categoria_id}
                onChange={alterarCampo}
              >
                <option value="">Sem categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles["form-description"]}>
              Descrição
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={alterarCampo}
                placeholder="Descrição do produto"
                rows={3}
              />
            </label>
          </div>

          <div className={styles["form-actions"]}>
            <button
              type="button"
              className={styles["product-cancel"]}
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </button>
            <button type="submit" className={styles["product-save"]}>
              Salvar produto
            </button>
          </div>
        </form>
      )}

      {erro && <p className={styles["products-error"]}>{erro}</p>}

      <section className={styles["products-list"]}>
        <div className={styles["products-list-heading"]}>
          <div>
            <h2>Lista de produtos</h2>
            <p>{produtosFiltrados.length} produtos encontrados</p>
          </div>

          <input
            className={styles["product-search"]}
            type="search"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando ? (
          <p className={styles["products-message"]}>Carregando produtos...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p className={styles["products-message"]}>Nenhum produto encontrado.</p>
        ) : (
          <div className={styles["products-table-wrapper"]}>
            <table className={styles["products-table"]}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id}>
                    <td>#{produto.id}</td>
                    <td>
                      <strong>{produto.nome}</strong>
                      <small>{produto.descricao || "Sem descrição"}</small>
                    </td>
                    <td>{nomeCategoria(produto.categoria_id)}</td>
                    <td>
                      {Number(produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </td>
                    <td>
                      <span className={styles["stock-badge"]}>
                        {produto.quantidade_estoque ?? 0} un.
                      </span>
                    </td>
                    <td className={styles["product-actions"]}>
                      <button onClick={() => abrirEdicao(produto)}>Editar</button>
                      <button onClick={() => excluirProduto(produto.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
    </>
  );
}