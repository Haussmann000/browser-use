import { useState } from "react";

type ApiResponse = {
  result: string;
};

const Home: React.FC = () => {
  const [task, setTask] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>タスクを実行</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="タスクを入力してください"
          rows={5}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            fontSize: "16px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "送信中..." : "送信"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>エラー: {error}</p>}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <h2>結果:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
