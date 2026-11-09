'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../pedidos.css';

const API_URL = 'https://ifro.edu.br';

export default function CriarPedido() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [carrinho, setCarrinho] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/clientes`).then((r) => r.json()),
      fetch(`${API_URL}/produtos`).then((r) => r.json()),
    ]).then(([dadosClientes, dadosProdutos]) => {
      setClientes(dadosClientes);
      setProdutos(dadosProdutos);
      if (dadosClientes.length > 0) setClienteId(String(dadosClientes[0].id));
      if (dadosProdutos.length > 0) setProdutoId(String(dadosProdutos[0].id));
    });
  }, []);

  function adicionarItem() {
    const prod = produtos.find((p) => p.id === Number(produtoId));
    if (!prod || quantidade < 1) return;

    const existente = carrinho.find((item) => item.produto_id === prod.id);
    if (existente) {
      setCarrinho(
        carrinho.map((item) =>
          item.produto_id === prod.id
            ? { ...item, quantidade: item.quantidade + Number(quantidade) }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        { produto_id: prod.id, nome: prod.nome, quantidade: Number(quantidade) },
      ]);
    }
    setQuantidade(1);
  }

  function removerItem(idProduto) {
    setCarrinho(carrinho.filter((item) => item.produto_id !== idProduto));
  }

  async function finalizarPedido(e) {
    e.preventDefault();
    if (!clienteId) return alert('Selecione um cliente.');
    if (carrinho.length === 0) return alert('Adicione pelo menos um produto ao pedido.');

    setEnviando(true);
    try {
      const resPedido = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: Number(clienteId) }),
      });

      if (!resPedido.ok) throw new Error('Erro ao criar pedido');
      const novoPedido = await resPedido.json();

      for (const item of carrinho) {
        await fetch(`${API_URL}/itens_pedido`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pedido_id: novoPedido.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
          }),
        });
      }

      alert('Pedido cadastrado com sucesso!');
      router.push('/pedidos');
    } catch (erro) {
      alert('Falha ao salvar: ' + erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pedidos-container">
      <div className="pedidos-wrapper">
        <div className="pedidos-header">
          <h1>Criar Novo Pedido</h1>
          <Link href="/pedidos" className="btn-tobacco">
            ← Voltar para Pedidos
          </Link>
        </div>

        <form onSubmit={finalizarPedido} className="card-library">
          <div className="form-grupo">
            <label htmlFor="cliente">Selecione o Cliente:</label>
            <select
              id="cliente"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <hr className="divisor-library" />

          <div className="linha-produto">
            <div className="form-grupo-sem-margem">
              <label htmlFor="produto">Produto:</label>
              <select
                id="produto"
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
              >
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grupo-sem-margem">
              <label htmlFor="qtd">Quantidade:</label>
              <input
                id="qtd"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <button type="button" onClick={adicionarItem} className="btn-tobacco">
              + Adicionar
            </button>
          </div>

          <div className="carrinho-secao">
            <h3 className="carrinho-titulo">Itens Adicionados:</h3>
            {carrinho.length === 0 ? (
              <p>Nenhum produto adicionado ainda.</p>
            ) : (
              <ul className="carrinho-lista">
                {carrinho.map((item) => (
                  <li key={item.produto_id} className="carrinho-item">
                    <span>
                      {item.nome} — <strong>Qtd: {item.quantidade}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => removerItem(item.produto_id)}
                      className="btn-remover"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="btn-oxblood btn-finalizar"
          >
            {enviando ? 'Salvando Pedido...' : 'Finalizar e Salvar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
}
