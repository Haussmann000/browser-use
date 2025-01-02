import { useState } from "react";
import { encoding_for_model } from "tiktoken";

type ApiResponse = {
  result: string;
};

const Home: React.FC = () => {
  const [task, setTask] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [tokenCount, setTokenCount] = useState(0);

  // トークン数を計算する関数
  const calculateTokens = (text: string) => {
    const encoding = encoding_for_model("gpt-4o-mini"); // GPT-4o-mini用エンコーディングを指定
    const tokens = encoding.encode(text);
    console.log(`tokens: ${tokens}`)
    encoding.free(); // メモリ解放
    return tokens.length;
  };

  // 入力が変更された時にトークン数を再計算
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const task = e.target.value;
    console.log(`task: ${task}`)
    setTask(task);
    const tokens = calculateTokens(task);
    setTokenCount(tokens);
  };


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
          onChange={(e) => handleChange(e)}
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
        <div
        style={{
          padding: "10px",
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginTop: "10px",
          fontSize: "16px",
        }}
        >
        <span>推計トークン数:</span> {tokenCount}
        <br></br>
        <br></br>
        <span>caliculated by <b><a href="https://github.com/openai/tiktoken/tree/main" target="blank">tiktoken</a></b></span>
      </div>
    </div>
  );
};

export default Home;
