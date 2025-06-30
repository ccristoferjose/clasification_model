import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sqlalchemy import create_engine
import boto3
import pymysql
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

# === CONSULTA SQL CON CATEGORÍA ===
query = """
SELECT 
    r.edad,
    r.genero,
    r.ppertenencia,
    r.fuente,
    r.deptoresiden,
    r.muniresiden,
    g.grupo_cie10
FROM registros_hospitalarios r
JOIN cie10 g ON r.caufin = g.codigo
WHERE LEFT(r.caufin, 1) NOT IN ('S', 'T', 'V', 'W', 'X', 'Y', 'Z')
AND g.grupo_cie10 NOT IN ('Periodo perinatal', 'Embarazo, parto y puerperio')
AND r.caufin NOT IN (
    'U04', 'U049',
    'U06', 'U060','U061','U062','U063','U064','U065','U066','U067','U068','U069',
    'U07','U070','U071','U072','U073','U074','U075','U076','U077','U078','U079',
    'U089','U09','U099','U129'
)
"""

# === CARGA DE DATOS ===
with engine.connect() as conn:
    df = pd.read_sql(query, conn)

# Filtrar categorías con al menos 100 registros
counts = df['grupo_cie10'].value_counts()
valid_categories = counts[counts >= 100].index
df = df[df['grupo_cie10'].isin(valid_categories)]

# === CODIFICACIÓN ===
label_encoders = {}
for col in ['genero', 'ppertenencia', 'fuente', 'deptoresiden', 'muniresiden', 'grupo_cie10']:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# === VARIABLES ===
X = df[['edad', 'genero', 'ppertenencia', 'fuente', 'deptoresiden', 'muniresiden']]
y = df['grupo_cie10']

# === ENTRENAMIENTO ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
clf = RandomForestClassifier(
    n_estimators=50,
    max_depth=15,
    min_samples_leaf=10,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
clf.fit(X_train, y_train)

# === GUARDADO LOCAL EN /opt/ml/model Y ./ CON COMPRESIÓN ===
output_dir = os.environ.get("SM_MODEL_DIR", "/opt/ml/model")
os.makedirs(output_dir, exist_ok=True)

joblib.dump(clf, os.path.join(output_dir, "rf_model_categorias.pkl"), compress=3)
joblib.dump(clf, "rf_model_categorias.pkl", compress=3)

for col, encoder in label_encoders.items():
    path = f"encoder_{col}.pkl"
    joblib.dump(encoder, os.path.join(output_dir, path), compress=3)
    joblib.dump(encoder, path, compress=3)

# === SUBIDA DIRECTA A S3 ===
s3.upload_file("rf_model_categorias.pkl", bucket_name, f"{s3_output_prefix}/rf_model_categorias.pkl")
for col in label_encoders.keys():
    fname = f"encoder_{col}.pkl"
    s3.upload_file(fname, bucket_name, f"{s3_output_prefix}/{fname}")

"Modelo por categorías entrenado y subido correctamente."
