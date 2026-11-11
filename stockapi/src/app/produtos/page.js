'use client';

import { useState, useEffect } from 'react';
import styles from './produtos.module.css';

const API_URL = 'https://ifro.edu.br';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do formulário de cadastro
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Carrega produtos e categorias ao abrir a página
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro('');
    try {
      const [resProdutos, resCategorias] = await Promise.all([
        fetch(`${API_URL}/produtos`),
        fetch(`${API_URL}/categorias`)
      ]);

      if (!resProdutos.ok || !resCategorias.ok) {
        throw new Error('Falha ao buscar dados da API');
      }

      const dadosProdutos = await resProdutos.json();
      const dadosCategorias = await resCategorias.json();

      setProdutos(dadosProdutos);
      setCategorias(dadosCategorias);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível carregar os produtos. Verifique a conexão com a API.');
    } finally {
      setCarregando(false);
    }
  }

  // Função auxiliar para descobrir o nome da categoria pelo ID
  function obterNomeCategoria(id) {
    const cat = categorias.find((c) => Number(c.id) === Number(id));
    return cat ? (cat.nome || cat.descricao) : `Categoria #${id || 'N/A'}`;
  }

  async function handleCadastrar(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem('');

    const novoProduto = {
      nome: nome.trim(),
      preco: parseFloat(preco),
      estoque: parseInt(estoque, 10),
      categoria_id: parseInt(categoriaId, 10)
    };

    try {
      const response = await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoProduto)
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar o produto');
      }

      setMensagem('Produto cadastrado com sucesso!');
      setNome('');
      setPreco('');
      setEstoque('');
      setCategoriaId('');
      
      // Atualiza a listagem na tela
      await carregarDados();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao cadastrar produto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Gerenciamento de Produtos</h1>

      <div className={styles.conteudoGrid}>
        {/* Formulário de Cadastro */}
        <section className={styles.cardForm}>
          <h2>Novo Produto</h2>
          <form onSubmit={handleCadastrar} className={styles.form}>
            <div className={styles.campo}>
              <label htmlFor="nome">Nome do Produto</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Mouse Sem Fio"
                required
              />
            </div>

            <div className={styles.linhaDupla}>
              <div className={styles.campo}>
                <label htmlFor="preco">Preço (R$)</label>
                <input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className={styles.campo}>
                <label htmlFor="estoque">Estoque</label>
                <input
                  id="estoque"
                  type="number"
                  min="0"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="">Selecione uma categoria...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome || cat.descricao || `Categoria ${cat.id}`}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.btnSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Cadastrar Produto'}
            </button>

            {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
          </form>
        </section>

        {/* Listagem Dinâmica de Produtos */}
        <section className={styles.secaoLista}>
          <div className={styles.cabecalhoLista}>
            <h2>Produtos Cadastrados ({produtos.length})</h2>
            <button onClick={carregarDados} className={styles.btnAtualizar} type="button">
              Atualizar
            </button>
          </div>

          {carregando && <p>Carregando produtos da API...</p>}
          {erro && <p className={styles.erro}>{erro}</p>}

          {!carregando && !erro && produtos.length === 0 && (
            <p>Nenhum produto encontrado.</p>
          )}

          <div className={styles.listaCards}>
            {produtos.map((prod) => (
              <article key={prod.id} className={styles.produtoCard}>
                <div>
                  <h3>{prod.nome}</h3>
                  <p className={styles.categoriaTag}>
                    {obterNomeCategoria(prod.categoria_id)}
                  </p>
                </div>
                <div className={styles.rodapeCard}>
                  <span className={styles.preco}>
                    {Number(prod.preco || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                  <span className={styles.estoqueBadge}>
                    Estoque: {prod.estoque ?? prod.quantidade ?? 0} un.
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
