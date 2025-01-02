import { useState } from "react";
import { encoding_for_model } from "tiktoken";

export interface TokenUsage {
  prompt_tokens: number;       // プロンプトに使用されたトークン数
  completion_tokens: number;   // 応答生成に使用されたトークン数
  total_tokens: number;        // 合計トークン数
}

type AgentResponse = {
  result: string;
  token_usage: TokenUsage | null;
};

const Home: React.FC = () => {
  const [task, setTask] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<AgentResponse["token_usage"]>(null);
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

      const data: AgentResponse = await response.json();
      setResult(data.result);
      setTokenUsage(data.token_usage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1><a href="https://github.com/browser-use/browser-use/" target="blank">browser-use</a></h1>
      <h2>Chatgptでブラウザを操作</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={task}
          onChange={(e) => handleChange(e)}
          placeholder="https://www.google.com/でラーメン二郎を検索"
          rows={5}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginTop: "2rem",
            marginBottom: "1rem",
            fontSize: "16px",
            borderRadius: "4px"
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "whitesmoke",
            borderRadius: "4px"
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
          marginTop: "1rem",
          fontSize: "16px",
        }}
        >
        <span>推計トークン： {tokenCount}  ( caliculated by <b><a href="https://www.npmjs.com/package/tiktoken" target="blank">tiktoken )</a></b></span>
        <br></br>
        <span>消費トークン：</span> {tokenUsage?.total_tokens || 0 }
      </div>
    </div>
  );
};

export default Home;
