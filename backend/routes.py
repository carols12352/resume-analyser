from flask import Blueprint, request, jsonify, current_app
import os
import logging
from werkzeug.utils import secure_filename
from backend.resume_parser import parse_resume
from backend.jd_matcher import match_resume_with_jd, suggest_skills_for_title
from backend.scorer import compute_weighted_score
from backend.gpt_feedback import get_resume_feedback

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_blueprint = Blueprint('api', __name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB limit

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    """确保上传目录存在"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
        logger.info(f"Created upload directory: {UPLOAD_FOLDER}")

def cleanup_file(file_path):
    """清理上传的临时文件"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temporary file: {file_path}")
    except Exception as e:
        logger.error(f"Error cleaning up file {file_path}: {str(e)}")

@api_blueprint.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "Resume Analyzer API is running",
        "endpoints": {
            "POST /api/parse-resume": "Upload and parse a resume",
            "POST /api/suggest-skills": "Get suggested skills for a job title",
            "POST /api/match-jd": "Match resume with job description",
            "POST /api/get-feedback": "Get feedback on resume"
        }
    })

@api_blueprint.route('/parse-resume', methods=['POST'])
def parse_resume_api():
    try:
        # 确保上传目录存在
        ensure_upload_folder()

        if 'file' not in request.files:
            logger.warning("No file part in request")
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            logger.warning("Empty filename submitted")
            return jsonify({"error": "Empty filename"}), 400

        if not allowed_file(file.filename):
            logger.warning(f"Invalid file type: {file.filename}")
            return jsonify({"error": "Only PDF files are allowed"}), 400

        # 检查文件大小
        file_content = file.read()
        file.seek(0)  # 重置文件指针
        if len(file_content) > MAX_CONTENT_LENGTH:
            logger.warning(f"File too large: {len(file_content)} bytes")
            return jsonify({"error": "File size exceeds 10MB limit"}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        try:
            file.save(file_path)
            logger.info(f"File saved: {file_path}")
            lang = request.form.get("lang", "en")
            result = parse_resume(file_path,lang=lang)
            
            if "error" in result:
                logger.error(f"Error parsing resume: {result['error']}")
                return jsonify({"error": "Failed to parse resume", "details": result["error"]}), 500
            
            return jsonify(result)
            
        finally:
            # 清理临时文件
            cleanup_file(file_path)

    except Exception as e:
        logger.error(f"Unexpected error in parse_resume_api: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api_blueprint.route('/suggest-skills', methods=['POST'])
def suggest_skills():
    try:
        data = request.get_json()
        lang = data.get("lang", "en")
        if not data:
            logger.warning("No JSON data in request")
            return jsonify({"error": "Missing request data"}), 400

        title = data.get('job_title', '').strip()
        if not title:
            logger.warning("Empty job title")
            return jsonify({"error": "Job title required"}), 400

        result = suggest_skills_for_title(title,lang=lang)
        
        if not result.get("success"):
            logger.error(f"Error suggesting skills: {result.get('error')}")
            return jsonify({"error": result.get("error", "Failed to suggest skills")}), 500

        return jsonify(result)

    except Exception as e:
        logger.error(f"Unexpected error in suggest_skills: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api_blueprint.route('/match-jd', methods=['POST'])
def match_jd():
    try:
        data = request.get_json()
        if not data:
            logger.warning("No JSON data in request")
            return jsonify({"error": "Missing request data"}), 400

        resume_data = data.get("resume")
        jd_text = data.get("jd")
        confirmed_skills = data.get("confirmed_skills", [])
        lang = data.get("lang", "en")
        if not resume_data:
            logger.warning("Missing resume data")
            return jsonify({"error": "Resume data is required"}), 400

        if not jd_text:
            logger.warning("Missing job description")
            return jsonify({"error": "Job description is required"}), 400

        result = match_resume_with_jd(resume_data, jd_text, confirmed_skills,lang=lang)

        if not result.get("success"):
            logger.error(f"Error matching JD: {result.get('error')}")
            return jsonify({"error": result.get("error", "Failed to match resume with job description")}), 500

        parsed = result["data"]
        gpt_score = parsed.get("match_score", 0)
        dimensions = parsed.get("dimensions", {})

        final_score = compute_weighted_score(dimensions, gpt_score)

        return jsonify({
            "success": True,
            "summary": parsed.get("summary"),
            "matched_skills": parsed.get("matched_skills", []),
            "missing_skills": parsed.get("missing_skills", []),
            "dimensions": dimensions,
            "gpt_score": gpt_score,
            "final_score": final_score
        })

    except Exception as e:
        logger.error(f"Unexpected error in match_jd: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@api_blueprint.route('/get-feedback', methods=['POST'])
def get_feedback():
    try:
        data = request.get_json()
        lang = data.get("lang", "en")
        if not data:
            logger.warning("No JSON data in request")
            return jsonify({"error": "Missing request data"}), 400

        resume = data.get('resume', {})
        if not resume:
            logger.warning("Missing resume data")
            return jsonify({"error": "Resume data is required"}), 400

        result = get_resume_feedback(resume,lang=lang)

        if not result.get("success"):
            logger.error(f"Error getting feedback: {result.get('error')}")
            return jsonify({"error": result.get("error", "Failed to generate feedback")}), 500

        return jsonify({
            "success": True,
            "data": {
                "strengths": result["data"].get("strengths", []),
                "suggestions": result["data"].get("suggestions", [])
            }
        })

    except Exception as e:
        logger.error(f"Unexpected error in get_feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

