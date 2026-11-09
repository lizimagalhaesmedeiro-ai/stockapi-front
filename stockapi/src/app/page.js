"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";

export default function Home() {
  const [totais, setTotais] = useState({
    produtos: 0,
    categorias: 0,
    clientes: 0,
    pedidos: 0
  });
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const integrantes = [
    { nome: "Eliza Magalhães Medeiro", funcao: "Desenvolvedora" },
    { nome: "Luis Roberto", funcao: "Desenvolvedor" },
    { nome: "Felipe Orocondo", funcao: "Desenvolvedor" },
    { nome: "Mabylle", funcao: "Desenvolvedora" }
  ];

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resProd, resCat, resCli, resPed] = await Promise.all([
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/produtos"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/categorias"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/clientes"),
          fetch("https://stock.dev.vilhena.ifro.edu.br/api/pedidos")
        ]);

        const dadosProd = await resProd.json();
        const dadosCat = await resCat.json();
        const dadosCli = await resCli.json();
        const dadosPed = await resPed.json();

        setTotais({
          produtos: Array.isArray(dadosProd) ? dadosProd.length : 0,
          categorias: Array.isArray(dadosCat) ? dadosCat.length : 0,
          clientes: Array.isArray(dadosCli) ? dadosCli.length : 0,
          pedidos: Array.isArray(dadosPed) ? dadosPed.length : 0
        });

        if (Array.isArray(dadosProd)) {
          setProdutos(dadosProd.slice(0, 6));
        }
      } catch (err) {
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <div>
      <Header />

      <div className="hero">
        <div className="container">
          <h1>Sistema de consumo da Stockapi</h1>
          <p>
            Aplicação desenvolvida para gerenciar produtos, categorias, clientes e
            pedidos em tempo real.
          </p>
        </div>
      </div>

      <main className="container">
        <section className="secao">
          <h2 className="titulo-secao">Integrantes do Grupo</h2>
          <div className="grid-quatro">
            {integrantes.map((item, index) => (
              <div key={index} className="card-integrante">
                <h3>{item.nome}</h3>
                <p>{item.funcao}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="secao">
          <h2 className="titulo-secao">Resumo Geral do Estoque (API)</h2>
          {carregando ? (
            <p className="aviso">Carregando dados da API...</p>
          ) : (
            <div className="grid-quatro">
              <div className="card-stat">
                <span className="stat-titulo">Produtos</span>
                <span className="stat-valor">{totais.produtos}</span>
                <Link href="/produtos" className="link-acao">Ver todos</Link>
              </div>

              <div className="card-stat">
                <span className="stat-titulo">Categorias</span>
                <span className="stat-valor">{totais.categorias}</span>
                <Link href="/categorias" className="link-acao">Ver todas</Link>
              </div>

              <div className="card-stat">
                <span className="stat-titulo">Clientes</span>
                <span className="stat-valor">{totais.clientes}</span>
                <Link href="/clientes" className="link-acao">Ver todos</Link>
              </div>

              <div className="card-stat">
                <span className="stat-titulo">Pedidos</span>
                <span className="stat-valor">{totais.pedidos}</span>
                <Link href="/pedidos" className="link-acao">Ver todos</Link>
              </div>
            </div>
          )}
        </section>

        <section className="secao">
          <h2 className="titulo-secao">Produtos Recentes em Estoque</h2>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Preço Unitário</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {produtos.length > 0 ? (
                  produtos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nome}</td>
                      <td>R$ {Number(p.preco).toFixed(2)}</td>
                      <td>{p.quantidade_estoque} un</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">Nenhum produto encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="secao">
          <h2 className="titulo-secao">Ações Rápidas</h2>
          <div className="botoes-grid">
            <Link href="/pedidos" className="btn btn-secundario">
              Listar Pedidos
            </Link>
            
            <Link href="/produtos" className="btn btn-secundario">
              Consultar Produtos
            </Link>
            <Link href="/categorias" className="btn btn-secundario">
              Consultar Categorias
            </Link>
            <Link href="/clientes" className="btn btn-secundario">
              Consultar Clientes
            </Link>
            <Link href="/pedidos/criar" className="btn btn-primario">
              Criar Novo Pedido
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
