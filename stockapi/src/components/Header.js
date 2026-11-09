"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          Painel de controle da Stockapi
        </Link>

        <button
          className="btn-menu"
          onClick={() => setAberto(!aberto)}
          aria-label="Alternar menu"
        >
          {aberto ? "✕" : "☰"}
        </button>

        <nav className={`nav-menu ${aberto ? "aberto" : ""}`}>
          <Link href="/" className="nav-link" onClick={() => setAberto(false)}>
            Home
          </Link>
          <Link href="/categorias" className="nav-link" onClick={() => setAberto(false)}>
            Categorias
          </Link>
          <Link href="/produtos" className="nav-link" onClick={() => setAberto(false)}>
            Produtos
          </Link>
          <Link href="/clientes" className="nav-link" onClick={() => setAberto(false)}>
            Clientes
          </Link>

          <div className="dropdown">
            <button className="dropdown-btn">
              Pedidos ▾
            </button>
            <div className="dropdown-menu">
              <Link href="/pedidos" className="dropdown-link" onClick={() => setAberto(false)}>
                Listar Pedidos
              </Link>
              <Link href="/pedidos/criar" className="dropdown-link" onClick={() => setAberto(false)}>
                Criar Pedido
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
