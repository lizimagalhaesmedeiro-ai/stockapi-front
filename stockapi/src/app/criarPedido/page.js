
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import { buscarDados, enviarDados } from "../../../services/api";

export default function CriarPedidoPage() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dadosClientes, dadosProdutos] = await Promise.all([
          buscarDados("clientes"),
          buscarDados("produtos")
        ]);

        setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
        setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);
      } catch (error) {
        setErro(error.message || "Erro ao carregar os dados.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  function adicionarProduto() {
    const produto = produtos.find(
      (item) => Number(item.id) === Number(produtoId)
    );

    const qtd = Number(quantidade);

    if (!produto) {
      setErro("Selecione um produto.");
      return;
    }

    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro("Informe uma quantidade válida.");
      return;
    }

    const preco = Number(produto.preco);

    setItens((lista) => {
      const existente = lista.find(
        (item) => Number(item.produto_id) === Number(produto.id)
      );

      if (existente) {
        return lista.map((item) =>
          Number(item.produto_id) === Number(produto.id)
            ? { ...item, quantidade: item.quantidade + qtd }
            : item
        );
      }

      return [
        ...lista,
        {
          produto_id: Number(produto.id),
          nome: produto.nome,
          preco: preco,
          quantidade: qtd
        }
      ];
    });

    setProdutoId("");
    setQuantidade("1");
    setErro("");
  }

  function removerProduto(id) {
    setItens((lista) =>
      lista.filter((item) => Number(item.produto_id) !== Number(id))
    );
  }

  const total = itens.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );

  async function criarPedido(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!clienteId) {
      setErro("Selecione um cliente.");
      return;
    }

    if (itens.length === 0) {
      setErro("Adicione pelo menos um produto.");
      return;
    }

    setSalvando(true);
    let pedidoCriado = null;

    try {
      pedidoCriado = await enviarDados("pedidos", "POST", {
        cliente_id: Number(clienteId)
      });

      for (const item of itens) {
        await enviarDados("itens_pedido", "POST", {
          pedido_id: Number(pedidoCriado.id),
          produto_id: Number(item.produto_id),
          quantidade: Number(item.quantidade),
          preco_unitario: Number(item.preco)
        });
      }

      setMensagem(`Pedido #${pedidoCriado.id} criado com sucesso!`);
      setClienteId("");
      setItens([]);
      setProdutoId("");
      setQuantidade("1");
    } catch (error) {
      if (pedidoCriado?.id) {
        setErro(
          `O pedido foi criado, mas ocorreu um erro ao registrar os produtos: ${error.message}`
        );
      } else {
        setErro(error.message || "Não foi possível criar o pedido.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Header />

      <main className="container pagina">
        <div className="pagina-topo">
          <div>
            <p className="sobre-titulo">NOVO REGISTRO</p>
            <h1 className="titulo-pagina">Criar pedido</h1>
            <p className="texto-pagina">
              Selecione o cliente e adicione os produtos.
            </p>
          </div>

          <Link href="/pedidos" className="btn btn-secundario">
            Voltar aos pedidos
          </Link>
        </div>

        {carregando ? (
          <p className="aviso">Carregando clientes e produtos...</p>
        ) : (
          <form className="criar-pedido-grid" onSubmit={criarPedido}>
            <section className="painel">
              <h2 className="titulo-painel">Dados do pedido</h2>

              <div className="formulario">
                <label htmlFor="cliente">Cliente</label>

                <select
                  id="cliente"
                  value={clienteId}
                  onChange={(event) => setClienteId(event.target.value)}
                  required
                >
                  <option value="">Selecione um cliente</option>

                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>

                <div className="linha-divisoria"></div>

                <h3 className="titulo-painel">Adicionar produto</h3>

                <label htmlFor="produto">Produto</label>

                <select
                  id="produto"
                  value={produtoId}
                  onChange={(event) => setProdutoId(event.target.value)}
                >
                  <option value="">Selecione um produto</option>

                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} - R$ {Number(produto.preco).toFixed(2)}
                    </option>
                  ))}
                </select>

                <label htmlFor="quantidade">Quantidade</label>

                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  step="1"
                  value={quantidade}
                  onChange={(event) => setQuantidade(event.target.value)}
                />

                <button
                  type="button"
                  className="btn btn-secundario"
                  onClick={adicionarProduto}
                >
                  Adicionar produto
                </button>
              </div>
            </section>

            <section className="painel">
              <div className="titulo-linha">
                <h2 className="titulo-painel">Itens do pedido</h2>
                <span className="contador">{itens.length}</span>
              </div>

              {itens.length === 0 ? (
                <p className="aviso">
                  Nenhum produto adicionado.
                </p>
              ) : (
                <div className="lista-registros">
                  {itens.map((item) => (
                    <article className="registro" key={item.produto_id}>
                      <div>
                        <strong>{item.nome}</strong>
                        <small>
                          {item.quantidade} x R$ {item.preco.toFixed(2)}
                        </small>
                      </div>

                      <div>
                        <strong>
                          R$ {(item.quantidade * item.preco).toFixed(2)}
                        </strong>

                        <button
                          type="button"
                          className="btn-remover"
                          onClick={() => removerProduto(item.produto_id)}
                        >
                          Remover
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="total-pedido">
                <span>Total</span>
                <strong>R$ {total.toFixed(2)}</strong>
              </div>

              <button
                type="submit"
                className="btn btn-primario"
                disabled={salvando || itens.length === 0 || !clienteId}
              >
                {salvando ? "Salvando..." : "Finalizar pedido"}
              </button>

              {erro && <p className="mensagem-erro">{erro}</p>}
              {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}
            </section>
          </form>
        )}
      </main>
    </>
  );
}
