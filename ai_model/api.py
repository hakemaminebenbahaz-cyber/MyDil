"""
API Flask — Modèle IA myDiL
-----------------------------
Port : 5001
Routes :
  POST /recommend   { "description": "je veux faire un robot" }
  POST /classify    { "name": "Niryo Ned2", "brand": "Niryo" }
  GET  /health
"""

import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

app = Flask(__name__)
CORS(app)

# ─── Chargement du modèle ─────────────────────────────────────────────────────

model_data = None

def load_model():
    global model_data
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("model.pkl introuvable — lance train.py d'abord")
    with open(MODEL_PATH, "rb") as f:
        model_data = pickle.load(f)
    print(f"[OK] Modele charge ({len(model_data['recommender']['equipment'])} equipements)")

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    eq_count = len(model_data["recommender"]["equipment"]) if model_data else 0
    return jsonify({ "status": "ok", "equipment_count": eq_count, "version": model_data.get("version") if model_data else None })


@app.route("/recommend", methods=["POST"])
def recommend():
    body = request.get_json()
    query = (body or {}).get("description", "").strip()
    top_k = int((body or {}).get("top_k", 5))

    if not query:
        return jsonify({ "error": "description manquante" }), 400

    rec = model_data["recommender"]
    vectorizer = rec["vectorizer"]
    matrix     = rec["matrix"]
    equipment  = rec["equipment"]

    # Vectorise la requête et calcule la similarité
    query_vec = vectorizer.transform([query.lower()])
    scores    = cosine_similarity(query_vec, matrix).flatten()

    # Top K résultats
    top_indices = scores.argsort()[::-1][:top_k]

    results = []
    for idx in top_indices:
        if scores[idx] < 0.01:
            continue
        eq = equipment[idx]
        results.append({
            "id":          eq["id"],
            "name":        eq["name"],
            "brand":       eq.get("brand"),
            "model":       eq.get("model"),
            "category":    eq["category"],
            "description": eq.get("description"),
            "score":       round(float(scores[idx]), 4),
            "reason":      f"Pertinence {round(scores[idx]*100)}% avec votre projet",
        })

    return jsonify({
        "recommendations": results,
        "query": query,
        "model": "TF-IDF cosine similarity — myDiL v1.0",
    })


@app.route("/classify", methods=["POST"])
def classify():
    if not model_data or not model_data.get("classifier"):
        return jsonify({ "error": "Classifier non disponible" }), 503

    body  = request.get_json()
    name  = (body or {}).get("name", "")
    brand = (body or {}).get("brand", "")
    text  = f"{name} {brand}".strip().lower()

    if not text:
        return jsonify({ "error": "name manquant" }), 400

    cls = model_data["classifier"]
    vec = cls["vectorizer"].transform([text])
    proba = cls["model"].predict_proba(vec)[0]
    pred  = cls["model"].predict(vec)[0]

    category = cls["encoder"].inverse_transform([pred])[0]
    confidence = round(float(proba.max()) * 100, 1)

    # Top 3 catégories
    top3_idx = proba.argsort()[::-1][:3]
    top3 = [
        { "category": cls["encoder"].inverse_transform([i])[0], "confidence": round(float(proba[i])*100, 1) }
        for i in top3_idx
    ]

    return jsonify({
        "category":   category,
        "confidence": confidence,
        "top3":       top3,
        "model":      "RandomForest — myDiL v1.0",
    })


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n[START] Demarrage API myDiL IA...")
    load_model()
    print("[OK] API disponible sur http://localhost:5001\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
