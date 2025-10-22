import { useEffect, useState } from "react";
import api from "../api/notetimeApi";

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchServicos() {
      try {
        setLoading(true);
        const res = await api.get("/servicos");
        setServicos(res.data);
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
        setError("Não foi possível carregar os serviços. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchServicos();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>Carregando serviços...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem", color: "red" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Serviços</h2>
      {servicos.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {servicos.map((servico) => (
            <li
              key={servico.id}
              style={{
                background: "#f3f3f3",
                marginBottom: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
              }}
            >
              <strong>{servico.nome}</strong>
              {servico.descricao && <p>{servico.descricao}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum serviço cadastrado.</p>
      )}
    </div>
  );
}
