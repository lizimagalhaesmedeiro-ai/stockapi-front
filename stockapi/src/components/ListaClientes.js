export default function ListaClientes({
  clientes,
  carregando,
  onEditar,
  onExcluir,
}) {
  if (carregando) {
    return <p className="clientes-card">Carregando clientes...</p>;
  }

  return (
    <section className="clientes-card">
      <h2>Lista de clientes</h2>

      {clientes.length === 0 ? (
        <p>Nenhum cliente cadastrado.</p>
      ) : (
        <div className="tabela-responsiva">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td data-label="ID">{cliente.id}</td>
                  <td data-label="Nome">{cliente.nome}</td>
                  <td data-label="E-mail">
                    {cliente.email || "Não informado"}
                  </td>
                  <td data-label="Telefone">
                    {cliente.telefone || "Não informado"}
                  </td>
                  <td data-label="Ações">
                    <div className="botoes-acoes">
                      <button
                        className="botao-editar"
                        onClick={() => onEditar(cliente)}
                      >
                        Editar
                      </button>

                      <button
                        className="botao-excluir"
                        onClick={() => onExcluir(cliente.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
