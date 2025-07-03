from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    # 🔁 Asegurar carga del archivo .env incluso si no se corre desde run.py
    load_dotenv()

    app = Flask(__name__)
    
    # ✅ Configurar CORS para permitir peticiones desde el frontend
    CORS(app, origins=[
        "http://clasification-app.s3-website.us-east-2.amazonaws.com",
        "https://clasification-app.s3-website.us-east-2.amazonaws.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ])

    # ✅ Cargar variables desde entorno
    app.config['USER_DB'] = os.getenv('USER_DB')
    app.config['PASSWORD_DB'] = os.getenv('PASSWORD_DB')
    app.config['HOST_DB'] = os.getenv('HOST_DB')
    app.config['DB_NAME'] = os.getenv('DB_NAME')

    # Registrar blueprint con prefijo /api
    from .routes import main
    app.register_blueprint(main, url_prefix='/api')

    return app