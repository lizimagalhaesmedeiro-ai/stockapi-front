
"use client";

import { useEffect, useState } from "react";

export default function CadastroCliente({
  onSalvar,
  clienteEditando,
  onCancelar,
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (clienteEditando) {
      setNome(clienteEditando.nome || "");
      setEmail(clienteEditando.email || "");
      setTelefone(clienteEditando.telefone || "");
    } else {
      setNome("");
      setEmail("");
      setTelefone("");
    }
  }, [clienteEditando]);

  async function enviarFormulario(event) {
    event.preventDefault();

    setSalvando(true);

    const cliente = {
      nome: nome.trim(),
      ...(email.trim() && { email: email.trim() }),
      ...(telefone.trim() && { telefone: telefone.trim() }),
    };

    const sucesso = await onSalvar(cliente);

    if (sucesso) {
      setNome("");
      setEmail("");
      setTelefone("");
    }

    setSalvando(false);
  }

  return (
    <section className="clientes-card">
      <h2>
        {clienteEditando ? "Editar cliente" : "Cadastrar cliente"}
      </h2>

      <form onSubmit={enviarFormulario}>
        <div className="form-grupo">
          <label htmlFor="nome">Nome *</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do cliente"
            required
          />
        </div>

        <div className="form-grupo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        <div className="form-grupo">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="form-acoes">
          <button type="submit" disabled={salvando}>
            {salvando
              ? "Salvando..."
              : clienteEditando
                ? "Atualizar cliente"
                : "Cadastrar cliente"}
          </button>

          {clienteEditando && (
            <button type="button" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
