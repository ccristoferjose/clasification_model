import os
import joblib
import numpy as np
import pandas as pd

def predecir_y_formatear_respuesta(model_dir, data_dict, top_n=10):
    # Cargar modelo y encoders
    clf = joblib.load(os.path.join(model_dir, "rf_model.pkl"))

    enc_genero = joblib.load(os.path.join(model_dir, "encoder_genero.pkl"))
    enc_ppertenencia = joblib.load(os.path.join(model_dir, "encoder_ppertenencia.pkl"))
    enc_fuente = joblib.load(os.path.join(model_dir, "encoder_fuente.pkl"))
    enc_deptoresiden = joblib.load(os.path.join(model_dir, "encoder_deptoresiden.pkl"))
    enc_muniresiden = joblib.load(os.path.join(model_dir, "encoder_muniresiden.pkl"))
    enc_caufin = joblib.load(os.path.join(model_dir, "encoder_caufin.pkl"))

    # Codificar entrada
    genero_enc = enc_genero.transform([data_dict["genero"]])[0]
    ppertenencia_enc = enc_ppertenencia.transform([data_dict["ppertenencia"]])[0]
    fuente_enc = enc_fuente.transform([data_dict["fuente"]])[0]
    deptoresiden_enc = enc_deptoresiden.transform([data_dict["deptoresiden"]])[0]
    muniresiden_enc = enc_muniresiden.transform([data_dict["muniresiden"]])[0]

    entrada = pd.DataFrame([{
        "edad": int(data_dict["edad"]),
        "genero": genero_enc,
        "ppertenencia": ppertenencia_enc,
        "fuente": fuente_enc,
        "deptoresiden": deptoresiden_enc,
        "muniresiden": muniresiden_enc
    }])

    # Predicción
    probs = clf.predict_proba(entrada)[0]
    top_idx = np.argsort(probs)[-top_n:][::-1]

    resultados = []
    for idx in top_idx:
        codigo = enc_caufin.inverse_transform([idx])[0]
        prob = round(probs[idx] * 100, 2)
        resultados.append({
            "caufin": codigo,
            "prob": prob
        })

    return resultados
