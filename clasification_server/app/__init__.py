from flask import Flask
from dotenv import load_dotenv
import os

def create_app():
    # 🔁 Asegurar carga del archivo .env incluso si no se corre desde run.py
    load_dotenv()

    app = Flask(__name__)

    # ✅ Cargar variables desde entorno
    app.config['USER_DB'] = os.getenv('USER_DB')
    app.config['PASSWORD_DB'] = os.getenv('PASSWORD_DB')
    app.config['HOST_DB'] = os.getenv('HOST_DB')
    app.config['DB_NAME'] = os.getenv('DB_NAME')

    # Registrar blueprint
    from .routes import main
    app.register_blueprint(main)

    return app