from transformers import pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load zero-shot classification model
fact_checker = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli"
)

@app.route("/fact-check", methods=["POST"])
def fact_check():
    data = request.get_json()
    text = data.get("text", "")
    
    if not text:
        return jsonify({"result": "❌ No text provided."})

    labels = ["true", "false", "opinion", "misleading"]

    try:
        result = fact_checker(text, candidate_labels=labels)
        top_label = result["labels"][0]
        score = result["scores"][0]
        return jsonify({
            "result": f"✅ Most likely: {top_label.upper()} ({score:.2f})"
        })
    except Exception as e:
        return jsonify({"result": f"❌ Could not process. {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
