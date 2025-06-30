import joblib
import numpy as np
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "categoria")

# === CARGAR MODELO Y CODIFICADORES ===
print("Cargando modelo desde disco...", flush=True)
clf = joblib.load(os.path.join(MODEL_PATH, "rf_model_categorias.pkl"))
print("Modelo cargado exitosamente.", flush=True)

enc_genero = joblib.load(os.path.join(MODEL_PATH, "encoder_genero.pkl"))
enc_ppertenencia = joblib.load(os.path.join(MODEL_PATH, "encoder_ppertenencia.pkl"))
enc_fuente = joblib.load(os.path.join(MODEL_PATH, "encoder_fuente.pkl"))
enc_deptoresiden = joblib.load(os.path.join(MODEL_PATH, "encoder_deptoresiden.pkl"))
enc_muniresiden = joblib.load(os.path.join(MODEL_PATH, "encoder_muniresiden.pkl"))
enc_categoria = joblib.load(os.path.join(MODEL_PATH, "encoder_grupo_cie10.pkl"))  # actualizar aquí

# === FUNCIÓN DE PREDICCIÓN ===
def predecir_top10(edad, genero, ppertenencia, fuente, deptoresiden, muniresiden):
    try:
        # Codificar entrada
        genero_enc = enc_genero.transform([genero])[0]
        ppertenencia_enc = enc_ppertenencia.transform([ppertenencia])[0]
        fuente_enc = enc_fuente.transform([fuente])[0]
        deptoresiden_enc = enc_deptoresiden.transform([deptoresiden])[0]
        muniresiden_enc = enc_muniresiden.transform([muniresiden])[0]

        entrada = pd.DataFrame([{
            "edad": edad,
            "genero": genero_enc,
            "ppertenencia": ppertenencia_enc,
            "fuente": fuente_enc,
            "deptoresiden": deptoresiden_enc,
            "muniresiden": muniresiden_enc
        }])

        # Predecir probabilidades
        probs = clf.predict_proba(entrada)[0]
        topN = 10
        topN_idx = np.argsort(probs)[-topN:][::-1]

        resultados = []
        for idx in topN_idx:
            categoria = enc_categoria.inverse_transform([idx])[0]
            probabilidad = round(probs[idx] * 100, 2)
            resultados.append((categoria, probabilidad))

        return resultados

    except Exception as e:
        print(f"Error durante la predicción: {e}", flush=True)
        return []
