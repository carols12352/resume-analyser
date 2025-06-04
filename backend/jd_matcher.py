import json
import re
from openai import OpenAI
from backend import get_client

client = get_client()

# ----------------- Job-Resume 匹配函数 -----------------

def match_resume_with_jd(resume_data: dict, jd_text: str, confirmed_skills: list = None):
    """
    使用 GPT 分析简历和 JD 的匹配度，返回结构化评分结果，包括维度细分。
    """
    if len(jd_text) > 3000:
        jd_text = jd_text[:3000] + "..."

    skill_hint = ""
    if confirmed_skills:
        skill_hint = f"\nThe reviewer has confirmed these key required skills: {confirmed_skills}.\n"

    prompt = f"""
You are a job matching expert. Given a resume and job description, analyze their compatibility across key aspects and return the result in JSON format.

Format:
{{
  "match_score": 0-100,  // overall score
  "summary": "One-line summary",
  "dimensions": {{
    "education_quality": 0-100,
    "major_relevance": 0-100,
    "skill_match": 0-100,
    "experience_relevance": 0-100,
    "soft_skills": 0-100
  }},
  "matched_skills": ["..."],
  "missing_skills": ["..."]
}}

Resume data (structured):
{json.dumps(resume_data, ensure_ascii=False)}

Job description:
\"\"\"{jd_text}\"\"\"
Skill hint is the skills reviewer asked you to match against:
{skill_hint}
Be strict and realistic in scoring. Ensure the response is valid JSON only.
missing skills should be the ones missing from the skill hints only
"""

    content = ""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert in resume and job matching."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=800
        )
        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)
        return {"success": True, "data": parsed}

    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]+\}", content)
        if match:
            try:
                parsed = json.loads(match.group(0))
                return {"success": True, "data": parsed}
            except Exception as e:
                return {"success": False, "error": f"JSON fallback failed: {str(e)}", "raw": content}
        return {"success": False, "error": "No valid JSON found", "raw": content}

    except Exception as e:
        return {"success": False, "error": str(e)}

# ----------------- 职位推荐技能函数 -----------------

def suggest_skills_for_title(job_title: str):
    """
    给定职位名称，返回 GPT 推荐的常见技能（最多 10 个）
    """
    prompt = f"""
You are a career expert. List 5–10 technical or soft skills commonly expected for the role of "{job_title}".
Return only a JSON array, e.g.: ["Skill1", "Skill2"]
"""

    content = ""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a job market assistant helping recruiters suggest relevant skills."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=300
        )

        content = response.choices[0].message.content.strip()
        try:
            skills = json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\[.*\]", content, re.DOTALL)
        if match:
            skills = json.loads(match.group(0))
        else:
            raise


        if isinstance(skills, list):
            return {"success": True, "suggested_skills": skills}
        return {"success": False, "error": "Response is not a list", "raw": content}

    except json.JSONDecodeError:
        return {"success": False, "error": "JSON parse error", "raw": content}
    except Exception as e:
        return {"success": False, "error": str(e)}
