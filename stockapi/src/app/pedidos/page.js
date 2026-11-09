'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import './pedidos.css';

const API_URL = 'https://ifro.edu.br';

export default function ListarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPedidos, resClientes, resItens, resProdutos] = await Promise.all([
          fetch(`${API_URL}/pedidos`),
          fetch(`${API_URL}/clientes`),
          fetch(`${API_URL}/itens_pedido`),
          fetch(`${API_URL}/produtos`),
        ]);

        if (!resPedidos.ok) throw new Error('Falha ao buscar dados da API');

        setPedidos(await resPedidos.json());
        setClientes(await resClientes.json());
        setItens(await resItens.json());
        setProdutos(await resProdutos.json());
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div className="pedidos-container">
        <div className="pedidos-wrapper">
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pedidos-container">
      <div className="pedidos-wrapper">
        <div className="pedidos-header">
          <h1>Pedidos Cadastrados</h1>
          <Link href="/pedidos/novo" className="btn-oxblood">
            + Novo Pedido
          </Link>
        </div>

        {erro && (
          <div className="card-library">
            <p>Erro: {erro}</p>
          </div>
        )}

        {pedidos.length === 0 ? (
          <div className="card-library">
            <p>Nenhum pedido encontrado no sistema.</p>
          </div>
        ) : (
          pedidos.map((pedido) => {
            const cliente = clientes.find((c) => c.id === pedido.cliente_id);
            const itensDoPedido = itens.filter((i) => i.pedido_id === pedido.id);

            return (
              <div key={pedido.id} className="card-library">
                <h2 className="pedido-titulo">
                  Pedido #{pedido.id} — {cliente ? cliente.nome : `Cliente #${pedido.cliente_id}`}
                </h2>

                <p className="pedido-subtitulo">Itens do Pedido:</p>
                {itensDoPedido.length === 0 ? (
                  <p>Nenhum item vinculado a este pedido.</p>
                ) : (
                  <ul className="lista-itens">
                    {itensDoPedido.map((item) => {
                      const prod = produtos.find((p) => p.id === item.produto_id);
                      return (
                        <li key={item.id}>
                          {prod ? prod.nome : `Produto #${item.produto_id}`} — <strong>Qtd: {item.quantidade}</strong>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
