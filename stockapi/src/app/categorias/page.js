"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

const API_URL = "https://stock.dev.vilhena.ifro.edu.br/api/categorias";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarCategorias() {
    try {
      setCarregando(true);
      setErro("");
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error("Erro ao buscar categorias.");
      }
      const dados = await res.json();
      setCategorias(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setErro(err.message || "Erro ao carregar categorias.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <>
      <Header />
      <main className="container secao">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 className="titulo-secao" style={{ margin: 0 }}>Categorias</h1>
            <p style={{ color: "var(--cor-secundaria)" }}>Listagem de categorias cadastradas no estoque</p>
          </div>
          <button className="btn btn-secundario" onClick={carregarCategorias} disabled={carregando}>
            Atualizar
          </button>
        </div>

        {carregando && <p className="aviso">Carregando categorias...</p>}
        {erro && <p style={{ color: "#a52222", background: "#f8dddd", padding: "12px", borderRadius: "8px" }}>{erro}</p>}

        {!carregando && !erro && categorias.length === 0 && (
          <p className="aviso">Nenhuma categoria encontrada.</p>
        )}

        <div className="grid-quatro">
          {categorias.map((cat) => (
            <div key={cat.id} className="card-stat" style={{ textAlign: "left" }}>
              <span className="stat-titulo">Categoria #{cat.id}</span>
              <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--cor-primaria)", margin: "8px 0" }}>
                {cat.nome}
              </span>
              <Link href="/produtos" className="link-acao">
                Ver produtos
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
