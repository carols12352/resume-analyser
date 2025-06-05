import json
import re
import pdfplumber
from backend import get_client

# 初始化 OpenAI 客户端
client = get_client()

def extract_text_from_pdf(file_path):
    """从 PDF 提取全文文本"""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def parse_resume(file_path, lang="en"):
    """
    使用 GPT 分析 PDF 简历，返回结构化 JSON，支持多语言输出
    """
    text = extract_text_from_pdf(file_path)

    language_name = {
        "zh": "Chinese",
        "en": "English",
        "fr": "French"
    }.get(lang, "English")

    prompt = f"""
You are a professional multilingual resume parser.

Your task is to extract structured information from the following resume text and output a valid JSON in {language_name}. 
If the resume content is not written in {language_name}, you must translate all entries into {language_name}.

The output must strictly follow this JSON format:

{{
  "name": "Full name (if present, else empty string)",
  "email": "Email address",
  "phone": "Phone number",
  "education": ["List of key education entries, such as degree, school name, years"],
  "experience": ["List of major work experiences, including role, company, and dates"],
  "skills": ["List of technical or soft skills mentioned in the resume"]
}}

Rules:
- Output valid JSON only — no explanations or comments.
- All fields must be present even if empty.
- Do not invent content — extract only what is actually present.
- Translate content into {language_name} if necessary.
- Keep the total output concise — under 1000 characters if possible.
- Return at most 5 entries for education and experience each.

Resume text:
{text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in multilingual resume parsing."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )

        content = response.choices[0].message.content.strip()

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

    except Exception as e:
        return {"error": f"Unexpected error during resume parsing: {str(e)}"}

