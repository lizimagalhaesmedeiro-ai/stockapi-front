
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { buscarDados } from "../../services/api";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarPedidos() {
    setCarregando(true);
    setErro("");

    try {
      const [dadosPedidos, dadosClientes, dadosItens] = await Promise.all([
        buscarDados("pedidos"),
        buscarDados("clientes"),
        buscarDados("itens_pedido")
      ]);

      setPedidos(Array.isArray(dadosPedidos) ? dadosPedidos : []);
      setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
      setItens(Array.isArray(dadosItens) ? dadosItens : []);
    } catch (error) {
      setErro(error.message || "Erro ao carregar pedidos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  function nomeCliente(id) {
    const cliente = clientes.find(
      (cliente) => Number(cliente.id) === Number(id)
    );

    return cliente ? cliente.nome : `Cliente #${id}`;
  }

  function quantidadeItens(pedidoId) {
    return itens
      .filter((item) => Number(item.pedido_id) === Number(pedidoId))
      .reduce((total, item) => total + Number(item.quantidade || 0), 0);
  }

  function formatarData(data) {
    if (!data) return "-";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) return "-";

    return dataConvertida.toLocaleDateString("pt-BR");
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const cliente = nomeCliente(pedido.cliente_id).toLowerCase();
    const pesquisa = busca.toLowerCase();

    return (
      String(pedido.id).includes(pesquisa) ||
      cliente.includes(pesquisa)
    );
  });

  return (
    <>
      <Header />

      <main className="container pagina">
        <div className="pagina-topo">
          <div>
            <p className="sobre-titulo">MOVIMENTAÇÕES</p>
            <h1 className="titulo-pagina">Pedidos</h1>
            <p className="texto-pagina">
              Consulte os pedidos cadastrados na loja.
            </p>
          </div>

          <div className="acoes-topo">
            <button
              className="btn btn-secundario"
              onClick={carregarPedidos}
              disabled={carregando}
            >
              Atualizar
            </button>

            <Link href="/pedidos/criar" className="btn btn-primario">
              Criar pedido
            </Link>
          </div>
        </div>

        <section className="grid-quatro">
          <article className="card-stat">
            <span className="stat-titulo">Total de pedidos</span>
            <strong className="stat-valor">{pedidos.length}</strong>
          </article>

          <article className="card-stat">
            <span className="stat-titulo">Total de clientes</span>
            <strong className="stat-valor">{clientes.length}</strong>
          </article>

          <article className="card-stat">
            <span className="stat-titulo">Itens registrados</span>
            <strong className="stat-valor">{itens.length}</strong>
          </article>

          <article className="card-stat">
            <span className="stat-titulo">Pedidos encontrados</span>
            <strong className="stat-valor">{pedidosFiltrados.length}</strong>
          </article>
        </section>

        <section className="painel" style={{ marginTop: 22 }}>
          <div className="titulo-linha">
            <h2 className="titulo-painel">Pedidos cadastrados</h2>
          </div>

          <input
            className="campo-busca"
            type="search"
            placeholder="Buscar por número ou nome do cliente..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />

          {erro && <p className="mensagem-erro">{erro}</p>}

          {carregando ? (
            <p className="aviso">Carregando pedidos...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="aviso">Nenhum pedido encontrado.</p>
          ) : (
            <div className="tabela-rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Quantidade de itens</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>#{pedido.id}</td>
                      <td>{nomeCliente(pedido.cliente_id)}</td>
                      <td>{formatarData(pedido.data_pedido)}</td>
                      <td>{quantidadeItens(pedido.id)}</td>
                      <td>{pedido.status || "Pendente"}</td>
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
