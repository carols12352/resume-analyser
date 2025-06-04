import json
import re
import pdfplumber
from openai import OpenAI
from backend import get_client


# 初始化 OpenAI 客户端（新版本写法）
client = get_client()

# -------------------- 核心文本提取 --------------------

def extract_text_from_pdf(file_path):
    """从 PDF 提取全文文本"""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


# -------------------- 主函数：GPT 解析简历 --------------------

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path)

    prompt = f"""
You are a professional resume parser. Please extract structured information from the following resume text and return a clean JSON in English, using the format below:

{{
  "name": "Full name (if present, else empty string)",
  "email": "Email address",
  "phone": "Phone number",
  "education": ["List of key education entries, such as degree, school name, years"],
  "experience": ["List of major work experiences, including role, company, and dates"],
  "skills": ["List of technical or soft skills mentioned in the resume"]
}}

Rules:
- Output must be valid JSON only — no explanations, no comments.
- All fields must be present even if empty.
- Try to preserve important original details (names of schools, companies, skill terms).
- Keep the final result concise: use under 1000 characters total if possible.
- Translate or rephrase into English if the original text is in another language.
- Do not hallucinate — only extract what’s present in the text.
- If multiple entries exist (e.g. education or experience), only pick the most relevant ones(up to 5).

Resume text:
{text}
"""

    # GPT-3.5 新接口调用方式
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert resume parser."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=1000
    )

    content = response.choices[0].message.content

    # 尝试解析为 JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]+\}", content)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception as e:
                return {"error": f"JSON fallback failed: {str(e)}", "raw": content}
        return {"error": "No valid JSON found in GPT response", "raw": content}
