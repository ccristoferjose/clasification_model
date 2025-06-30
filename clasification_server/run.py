import os
from dotenv import load_dotenv
from app import create_app

# Cargar variables desde .env antes de crear la app
load_dotenv()

# Crear aplicación Flask
app = create_app()

# Leer el puerto y modo debug desde entorno
PORT = int(os.environ.get("PORT", 5000))
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

if __name__ == "__main__":
    print(f"Servidor iniciado en http://0.0.0.0:{PORT} | Debug: {DEBUG}", flush=True)
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)