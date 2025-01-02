from flask import Flask, request, jsonify
from browser_use import Agent, Browser, BrowserConfig
from langchain_openai import ChatOpenAI
import asyncio, os
from os.path import join, dirname
from openai import OpenAI
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

class CustomAgent(Agent):
    def __init__(self, llm, task, browser):
        super().__init__(llm=llm, task=task, browser=browser)

    async def calculate_tokens(self, messages):
        """
        OpenAI APIを使用してトークン数を計算します。
        """
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # 必要に応じてモデルを変更
                messages=messages,
                temperature=0
            )
            usage = response["usage"]
            return {
                "prompt_tokens": usage["prompt_tokens"],
                "completion_tokens": usage.get("completion_tokens", 0),
                "total_tokens": usage["total_tokens"]
            }
        except Exception as e:
            print(f"Error calculating tokens: {e}")
            return None

    async def run_with_token_calculation(self):
        """
        通常のrunメソッドにトークン計算を追加します。
        """
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": self.task}
        ]
        # トークン数を計算
        token_usage = await self.calculate_tokens(messages)

        # オリジナルのrunメソッドを実行
        result = await super().run()

        return {
            "result": result,
            "token_usage": token_usage
        }


async def run_agent(task):
    llm = ChatOpenAI(model="gpt-4o-mini")
    browser = Browser(
        config=BrowserConfig(
            headless=True,
        )
    )

    agent = CustomAgent(
        task=task,
        llm=llm,
        browser=browser
    )
    result = await agent.run_with_token_calculation()
    return result

# タスク実行用のエンドポイント
@app.route("/api/task", methods=["POST"])
def run_task():
    try:
        # クライアントから送信されたデータを取得
        data = request.json
        task = data.get("task")
        if not task:
            return jsonify({"error": "タスクが空です"}), 400

        # 非同期タスクを実行
        result = asyncio.run(run_agent(task))
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": f"エージェントの実行中にエラーが発生しました: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
