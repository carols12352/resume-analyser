from flask import Flask
import os
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_URL
def create_app():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    template_dir = os.path.join(base_dir, "templates")
    app = Flask(__name__, template_folder=template_dir)
    app.config.from_pyfile('../config.py')
    
    from .routes import api_blueprint
    app.register_blueprint(api_blueprint)
    
    return app
_client = None
def get_client():
    global _client
    if not _client:
        _client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_URL)
    return _client
