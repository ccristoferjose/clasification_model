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

def obtener_departamentos(engine: Engine) -> list[dict]:
    """
    Obtiene todos los departamentos ordenados por ID
    """
    sql = "SELECT id, nombre FROM departamento ORDER BY id ASC"
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [{"id": row["id"], "nombre": row["nombre"]} for row in result.fetchall()]

def obtener_municipios_por_departamento(engine: Engine, departamento_id: str) -> list[dict]:
    """
    Obtiene todos los municipios de un departamento específico ordenados por nombre
    """
    sql = "SELECT id, nombre FROM municipio WHERE id_departamento = :departamento_id ORDER BY nombre"
    
    with engine.connect() as conn:
        result = conn.execute(text(sql), {"departamento_id": departamento_id})
        return [{"id": row["id"], "nombre": row["nombre"]} for row in result.fetchall()]

def obtener_patologias_cie10(engine: Engine) -> list[dict]:
    """
    Obtiene todas las patologías de la tabla cie10 con código, descripción y grupo_cie10
    """
    sql = "SELECT codigo, descripcion, grupo_cie10 FROM cie10 ORDER BY codigo ASC"
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [
            {
                "codigo": row["codigo"], 
                "descripcion": row["descripcion"],
                "grupo_cie10": row["grupo_cie10"]
            } 
            for row in result.fetchall()
        ]

def obtener_categorias_cie10(engine: Engine) -> list[dict]:
    """
    Obtiene todas las categorías (grupos CIE10) únicos
    """
    sql = "SELECT DISTINCT grupo_cie10 FROM cie10 WHERE grupo_cie10 IS NOT NULL ORDER BY grupo_cie10 ASC"
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [{"categoria": row["grupo_cie10"]} for row in result.fetchall()]

def obtener_patologias_por_categoria(engine: Engine, categoria: str) -> list[dict]:
    """
    Obtiene todas las patologías de una categoría específica (grupo CIE10)
    """
    sql = "SELECT codigo, descripcion, grupo_cie10 FROM cie10 WHERE grupo_cie10 = :categoria ORDER BY codigo ASC"
    
    with engine.connect() as conn:
        result = conn.execute(text(sql), {"categoria": categoria})
        return [
            {
                "codigo": row["codigo"], 
                "descripcion": row["descripcion"],
                "grupo_cie10": row["grupo_cie10"]
            } 
            for row in result.fetchall()
        ]
