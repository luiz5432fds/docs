from flask import Flask, request, jsonify, render_template
import os
import openai

app = Flask(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY


def answer_question(message: str) -> str:
    if not OPENAI_API_KEY:
        return "Configure a variavel OPENAI_API_KEY para respostas reais."
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message}],
        max_tokens=150,
    )
    return response.choices[0].message["content"].strip()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    message = data.get("message", "")
    return jsonify({"response": answer_question(message)})


if __name__ == "__main__":
    app.run(debug=True)
