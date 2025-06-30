import os
import pandas as pd
import joblib
from slugify import slugify
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv
from datetime import datetime
import boto3

# === CARGAR VARIABLES DE ENTORNO ===
load_dotenv()

USER_DB = os.getenv("USER_DB")
PASSWORD_DB = os.getenv("PASSWORD_DB")
HOST_DB = os.getenv("HOST_DB")
DB_NAME = os.getenv("DB_NAME")
BUCKET = os.getenv("S3_BUCKET")
S3_PREFIX = os.getenv("S3_PREFIX")

# === CONEXIÓN BD y S3 ===
engine = create_engine(f"mysql+pymysql://{USER_DB}:{PASSWORD_DB}@{HOST_DB}/{DB_NAME}")
s3 = boto3.client("s3")

# === TIMESTAMP GLOBAL PARA VERSIÓN DE MODELOS ===
TIMESTAMP = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")

# === OBTENER TODAS LAS CATEGORÍAS ===
categorias_query = """
SELECT DISTINCT grupo_cie10
FROM cie10
WHERE grupo_cie10 NOT IN ('Periodo perinatal', 'Embarazo, parto y puerperio')
"""
categorias = pd.read_sql(categorias_query, engine)['grupo_cie10'].dropna().tolist()

# === FUNCIÓN DE ENTRENAMIENTO POR CATEGORÍA ===
def entrenar_categoria(categoria: str):
    slug = slugify(categoria)
    s3_model_prefix = f"{S3_PREFIX}/model_{slug}/{TIMESTAMP}"

    print(f"\nEntrenando modelo para: {categoria} [{slug}]")

    query = f"""
    SELECT r.edad, r.genero, r.ppertenencia, r.fuente, r.deptoresiden, r.muniresiden, r.caufin
    FROM registros_hospitalarios r
    JOIN cie10 g ON r.caufin = g.codigo
    WHERE g.grupo_cie10 = '{categoria.replace("'", "''")}'
    """
    df = pd.read_sql(query, engine)

    # Filtrar causas con pocas ocurrencias
    valid = df["caufin"].value_counts()
    df = df[df["caufin"].isin(valid[valid >= 30].index)]

    if len(df["caufin"].unique()) < 2 or len(df) < 300:
        print(f"✗ No hay suficientes datos para {categoria}. Se omite.")
        return

    # Codificación
    encoders = {}
    for col in ["genero", "ppertenencia", "fuente", "deptoresiden", "muniresiden", "caufin"]:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le

    X = df[["edad", "genero", "ppertenencia", "fuente", "deptoresiden", "muniresiden"]]
    y = df["caufin"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(
        n_estimators=50,
        max_depth=15,
        min_samples_leaf=10,
        class_weight="balanced_subsample",
        n_jobs=-1,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Guardar y subir archivos temporalmente
    joblib.dump(model, "rf_model.pkl", compress=3)
    s3.upload_file("rf_model.pkl", BUCKET, f"{s3_model_prefix}/rf_model.pkl")
    os.remove("rf_model.pkl")

    for col, enc in encoders.items():
        fname = f"encoder_{col}.pkl"
        joblib.dump(enc, fname, compress=3)
        s3.upload_file(fname, BUCKET, f"{s3_model_prefix}/{fname}")
        os.remove(fname)

    print(f"✓ Modelo para '{categoria}' entrenado y subido correctamente.")

# === EJECUTAR ENTRENAMIENTO ===
for cat in categorias:
    try:
        entrenar_categoria(cat)
    except Exception as e:
        print(f"Error con '{cat}': {e}")
