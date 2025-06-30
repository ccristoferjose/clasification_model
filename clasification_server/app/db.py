from sqlalchemy import text
from sqlalchemy.engine import Engine

def obtener_descripciones_cie10(engine: Engine, codigos: list[str]) -> dict:
    if not codigos:
        return {}
    
    placeholders = ", ".join([f":code{i}" for i in range(len(codigos))])
    sql = f"SELECT codigo, descripcion FROM cie10 WHERE codigo IN ({placeholders})"

    params = {f"code{i}": codigo for i, codigo in enumerate(codigos)}

    with engine.connect() as conn:
        result = conn.execute(text(sql), params)
        return {row["codigo"]: row["descripcion"] for row in result.fetchall()}
