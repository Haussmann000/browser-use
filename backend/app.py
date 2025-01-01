from flask import Flask, request, jsonify
from browser_use import Agent, Browser, BrowserConfig
from langchain_openai import ChatOpenAI
import asyncio, os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def run_agent(task):
    llm = ChatOpenAI(model="gpt-4o-mini")
    browser = Browser(
        config=BrowserConfig(
            headless=True,
        )
    )

    agent = Agent(
        task=task,
        llm=llm,
        browser=browser
    )
    result = await agent.run()
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
