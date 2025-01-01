from flask import Flask, render_template, request, jsonify
from browser_use import Agent
from langchain_openai import ChatOpenAI
import asyncio

app = Flask(__name__)

# 非同期タスクを実行する関数
async def run_agent(task):
    agent = Agent(
        task=task,
        llm=ChatOpenAI(model="gpt-4o-mini"),
    )
    result = await agent.run()
    return result

# フロントページ
@app.route("/")
def index():
    return render_template("index.html")

# タスクを処理するエンドポイント
@app.route("/run-task", methods=["POST"])
def run_task():
    task = request.form.get("task")
    if not task:
        return jsonify({"error": "タスクを入力してください"}), 400

    try:
        result = asyncio.run(run_agent(task))
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": f"エージェントの実行中にエラーが発生しました: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
