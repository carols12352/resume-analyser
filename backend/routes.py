from flask import Blueprint, request, jsonify, render_template
import os
from werkzeug.utils import secure_filename
from backend.resume_parser import parse_resume
from backend.jd_matcher import match_resume_with_jd, suggest_skills_for_title

api_blueprint = Blueprint('api', __name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api_blueprint.route('/', methods=['GET'])
def index():
    return render_template('upload.html')

@api_blueprint.route('/parse-resume', methods=['POST'])
def parse_resume_api():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    if allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        result = parse_resume(file_path)
        return jsonify(result)

    return jsonify({"error": "Invalid file type"}), 400

@api_blueprint.route('/match-jd', methods=['POST'])
def match_jd_api():
    data = request.get_json()
    resume_data = data.get("resume")
    jd_text = data.get("jd")
    confirmed_skills = data.get("confirmed_skills", [])

    if not resume_data or not jd_text:
        return jsonify({"error": "Missing resume or job description"}), 400

    result = match_resume_with_jd(resume_data, jd_text, confirmed_skills)
    return jsonify(result)

@api_blueprint.route('/suggest-skills', methods=['POST'])
def suggest_skills():
    data = request.get_json()
    title = data.get('job_title', '')
    if not title:
        return jsonify({"error": "Job title required"}), 400

    result = suggest_skills_for_title(title)
    return jsonify(result)

