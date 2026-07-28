"""
Modèle de recommandation myDiL
-------------------------------
Entraîne deux modèles :
  1. TF-IDF + cosine similarity  → recommande du matériel selon un texte de projet
  2. Classifier catégorie        → prédit la catégorie d'un équipement par son nom

Usage : python train.py
"""

import os
import pickle
import urllib.request
import json
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

NEXTJS_URL = "http://localhost:3000"
DATA_FILE  = os.path.join(os.path.dirname(__file__), "data.json")

# ─── 1. Récupération des données ─────────────────────────────────────────────

def get_data():
    # Essaie depuis le fichier data.json d'abord
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, encoding="utf-8") as f:
            raw = json.load(f)
        equipment = pd.DataFrame(raw["equipment"])
        loans     = pd.DataFrame(raw.get("loans", []))
        return equipment, loans

    # Sinon essaie depuis Next.js
    print("  data.json introuvable, tentative via Next.js API...")
    with urllib.request.urlopen(f"{NEXTJS_URL}/api/equipment", timeout=5) as r:
        equipment = pd.DataFrame(json.loads(r.read()))
    try:
        with urllib.request.urlopen(f"{NEXTJS_URL}/api/loans", timeout=5) as r:
            loans = pd.DataFrame(json.loads(r.read()))
    except Exception:
        loans = pd.DataFrame(columns=["equipmentId", "userId"])
    return equipment, loans

# ─── 2. Feature engineering ──────────────────────────────────────────────────

CAT_FR = {
    "IOT": "IoT capteur connecté électronique",
    "VR_AR": "réalité virtuelle augmentée casque",
    "ROBOTICS": "robot bras robotique programmation",
    "NETWORK": "réseau switch routeur câble",
    "PRINTING_3D": "impression 3D filament imprimante",
    "COMPUTER": "ordinateur informatique laptop",
    "PERIPHERALS": "périphérique écran clavier souris",
    "AUDIO": "audio son microphone enceinte",
    "COMPONENTS": "composant électronique Arduino Raspberry",
    "TOOLS": "outil visserie mécanique",
    "CONSUMABLE": "consommable matière première",
    "MISC": "divers autre matériel",
}

def build_features(equipment: pd.DataFrame) -> pd.Series:
    def row_text(r):
        parts = [
            r["name"] or "",
            r["brand"] or "",
            r["model"] or "",
            r["description"] or "",
            CAT_FR.get(r["category"], r["category"]),
        ]
        return " ".join(p for p in parts if p).lower()

    return equipment.apply(row_text, axis=1)

# ─── 3. Modèle 1 — Recommandation TF-IDF ─────────────────────────────────────

def train_recommender(equipment: pd.DataFrame):
    texts = build_features(equipment)

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
    )
    matrix = vectorizer.fit_transform(texts)

    print(f"  [OK] TF-IDF matrix : {matrix.shape[0]} équipements × {matrix.shape[1]} features")
    return vectorizer, matrix, equipment

# ─── 4. Modèle 2 — Classifier de catégorie ───────────────────────────────────

def train_classifier(equipment: pd.DataFrame):
    texts = build_features(equipment)
    labels = equipment["category"]

    le = LabelEncoder()
    y  = le.fit_transform(labels)

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=3000)
    X = vectorizer.fit_transform(texts)

    if len(set(y)) < 2:
        print("  [WARN] Pas assez de catégories pour entraîner le classifier")
        return None, None, None

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    acc = accuracy_score(y_test, clf.predict(X_test)) if len(X_test.toarray()) > 0 else 1.0
    print(f"  [OK] Classifier catégorie — précision : {acc*100:.1f}%")

    return vectorizer, clf, le

# ─── 5. Sauvegarde ───────────────────────────────────────────────────────────

def save_model(data: dict, path: str):
    with open(path, "wb") as f:
        pickle.dump(data, f)
    print(f"  [OK] Modele sauvegarde : {path}")

# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n[DB] Connexion à la base de données...")
    equipment, loans = get_data()
    print(f"  [OK] {len(equipment)} équipements chargés")
    print(f"  [OK] {len(loans)} emprunts chargés")

    print("\n[AI] Entraînement Modèle 1 — Recommandation...")
    vec1, matrix, eq = train_recommender(equipment)

    print("\n[AI] Entraînement Modèle 2 — Classification catégorie...")
    vec2, clf, le = train_classifier(equipment)

    print("\n[SAVE] Sauvegarde...")
    model_data = {
        "recommender": {
            "vectorizer": vec1,
            "matrix":     matrix,
            "equipment":  eq.to_dict("records"),
        },
        "classifier": {
            "vectorizer": vec2,
            "model":      clf,
            "encoder":    le,
        } if clf is not None else None,
        "version": "1.0",
    }
    save_model(model_data, os.path.join(os.path.dirname(__file__), "model.pkl"))

    print("\n[OK] Entraînement terminé !\n")
