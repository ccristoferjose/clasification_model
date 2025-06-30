import os
import pandas as pd
import joblib
import tarfile
import boto3
from slugify import slugify
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from dotenv import load_dotenv

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
    carpeta = f"model_{slug}"
    os.makedirs(carpeta, exist_ok=True)

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

    # Guardar modelo y encoders
    model_dir = os.path.join(carpeta, "rf_model")
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, os.path.join(model_dir, "rf_model.pkl"), compress=3)
    for col, enc in encoders.items():
        joblib.dump(enc, os.path.join(model_dir, f"encoder_{col}.pkl"), compress=3)

    # Comprimir carpeta
    tar_path = f"{carpeta}.tar.gz"
    with tarfile.open(tar_path, "w:gz") as tar:
        tar.add(model_dir, arcname="rf_model")

    # Subir a S3
    s3.upload_file(tar_path, BUCKET, f"{S3_PREFIX}/{carpeta}.tar.gz")
    print(f"✓ Modelo para '{categoria}' entrenado y subido correctamente.")

# === EJECUTAR ENTRENAMIENTO ===
for cat in categorias:
    try:
        entrenar_categoria(cat)
    except Exception as e:
        print(f"Error con '{cat}': {e}")
