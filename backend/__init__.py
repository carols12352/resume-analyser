from flask import Flask
from flask_cors import CORS
import os
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_URL

def create_app(test_config=None):
    app = Flask(__name__)
    CORS(app)  # 启用CORS支持

    if test_config is None:
        app.config.from_mapping(
            SECRET_KEY='dev',
            UPLOAD_FOLDER='uploads'
        )
    else:
        app.config.update(test_config)

    # 确保上传文件夹存在
    try:
        os.makedirs(app.config['UPLOAD_FOLDER'])
    except OSError:
        pass

    from .routes import api_blueprint
    app.register_blueprint(api_blueprint)

    return app

_client = None
def get_client():
    global _client
    if not _client:
        _client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_URL)
    return _client
