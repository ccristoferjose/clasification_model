from flask import Blueprint, request, jsonify, current_app
from .predecir_causa import predecir_top10
from sqlalchemy import create_engine
from .db import obtener_descripciones_cie10
import os

main = Blueprint("main", __name__)

def obtener_descripciones(categorias: list[str]) -> dict:
    return {
        cat: {
            "categoria": cat,
            "descripcion": f"Grupo CIE-10: {cat}"
        }
        for cat in categorias
    }

def get_engine_from_config():
    user = current_app.config.get('USER_DB')
    password = current_app.config.get('PASSWORD_DB')
    host = current_app.config.get('HOST_DB')
    db = current_app.config.get('DB_NAME')

    return create_engine(f'mysql+pymysql://{user}:{password}@{host}/{db}')

@main.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        resultados = predecir_top10(
            int(data["edad"]),
            data["genero"],
            data["ppertenencia"],
            data["fuente"],
            data["deptoresiden"],
            data["muniresiden"]
        )

        categorias = [cat for cat, _ in resultados]
        info_map = obtener_descripciones(categorias)

        predictions = []
        for categoria, prob in resultados:
            info = info_map.get(categoria, {})
            predictions.append({
                "categoria": categoria,
                "prob": prob,
                "descripcion": info.get("descripcion", "Descripción no disponible")
            })

        return jsonify({"success": True, "predictions": predictions})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)})

@main.route("/predict_causas", methods=["POST"])
def predict_causas():
    try:
        data = request.json
        categoria = data.get("categoria")

        slug = categoria.strip().lower().replace(" ", "-").replace(",", "").replace("í", "i").replace("ó", "o")
        model_dir = os.path.join(os.path.dirname(__file__), "models", f"model_{slug}", "rf_model")

        if not os.path.isdir(model_dir):
            return jsonify({"success": False, "error": f"Modelo para categoría '{categoria}' no encontrado"}), 404

        from .utils_prediccion import predecir_y_formatear_respuesta
        resultado = predecir_y_formatear_respuesta(model_dir, data, top_n=10)
        if not resultado:
            return jsonify({"success": False, "error": "No se encontraron resultados para la predicción"}), 404

        codigos = [r["caufin"] for r in resultado]
        print(f"Obteniendo descripciones para códigos: {codigos}", flush=True)

        engine = get_engine_from_config()
        descripciones = obtener_descripciones_cie10(engine, codigos)

        for r in resultado:
            r["descripcion"] = descripciones.get(r["caufin"], "Descripción no disponible")

        return jsonify({"success": True, "predictions": resultado})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)})
