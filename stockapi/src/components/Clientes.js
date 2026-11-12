
"use client";

import { useEffect, useState } from "react";
import CadastroCliente from "./CadastroCliente";
import ListaClientes from "./ListaClientes";
import "./Clientes.css";

const API_URL = "https://stock.dev.vilhena.ifro.edu.br/api/clientes";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [clienteEditando, setClienteEditando] = useState(null);

  async function carregarClientes() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(API_URL);
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error("Erro ao buscar clientes.");
      }

      setClientes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function salvarCliente(cliente) {
    try {
      setErro("");
      setMensagem("");

      const editando = Boolean(clienteEditando);
      const url = editando
        ? `${API_URL}/${clienteEditando.id}`
        : API_URL;

      const resposta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível salvar o cliente.");
      }

      setMensagem(
        editando
          ? "Cliente atualizado com sucesso!"
          : "Cliente cadastrado com sucesso!"
      );

      setClienteEditando(null);
      await carregarClientes();
      return true;
    } catch (error) {
      setErro(error.message);
      return false;
    }
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível excluir o cliente.");
      }

      setMensagem("Cliente excluído com sucesso!");
      setClienteEditando(null);
      await carregarClientes();
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <main className="clientes-container">
      <header className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Gerenciamento de clientes da loja</p>
        </div>

        <span className="clientes-total">
          {clientes.length} clientes
        </span>
      </header>

      <CadastroCliente
        onSalvar={salvarCliente}
        clienteEditando={clienteEditando}
        onCancelar={() => setClienteEditando(null)}
      />

      {erro && <p className="mensagem erro">{erro}</p>}
      {mensagem && <p className="mensagem sucesso">{mensagem}</p>}

      <ListaClientes
        clientes={clientes}
        carregando={carregando}
        onEditar={setClienteEditando}
        onExcluir={excluirCliente}
      />
    </main>
  );
}
