const BASE_URL = "https://stock.dev.vilhena.ifro.edu.br/api";

export async function buscarDados(endpoint) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Falha ao carregar dados de ${endpoint}`);
  }

  return res.json();
}

export async function enviarDados(endpoint, method = "POST", body = null) {
  const configuracao = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (body) {
    configuracao.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}/${endpoint}`, configuracao);

  if (!res.ok) {
    const dadosErro = await res.json().catch(() => ({}));
    throw new Error(dadosErro.erro || dadosErro.message || `Falha ao processar ${endpoint}`);
  }

  return res.json();
}
