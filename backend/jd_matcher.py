import json
import re
from openai import OpenAI
from backend import get_client

client = get_client()

# ----------------- Job-Resume 匹配函数 -----------------

def match_resume_with_jd(resume_data: dict, jd_text: str, confirmed_skills: list = None):
    """
    使用 GPT 分析简历和 JD 的匹配度，返回结构化匹配结果。
    """
    # 可选：对 JD 长度做截断（防止超长）
    if len(jd_text) > 3000:
        jd_text = jd_text[:3000] + "..."

    skill_hint = ""
    if confirmed_skills:
        skill_hint = f"\nThe reviewer has confirmed these key required skills for the JD: {confirmed_skills}.\nPlease focus on them when evaluating the match.\n"

    prompt = f"""
You are an intelligent job matching assistant. Given the resume data and a job description, analyze how well they match. Return a valid JSON with this format:

{{
  "match_score": "Integer from 0 to 100",
  "summary": "One-sentence summary of the match",
  "matched_skills": ["List of matching skills or experiences"],
  "missing_skills": ["List of important skills from JD not found in the resume"]
}}

Here is the resume (already structured):
{json.dumps(resume_data, ensure_ascii=False)}

Here is the job description:
\"\"\"{jd_text}\"\"\"

{skill_hint}
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
            max_tokens=700
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
You're a career expert. Please list 5–10 technical or soft skills commonly expected for the job title: \"{job_title}\".

Output only a clean JSON array, like:
["Skill1", "Skill2", "Skill3"]
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
        skills = json.loads(content)
        if isinstance(skills, list):
            return {"success": True, "suggested_skills": skills}
        return {"success": False, "error": "Response is not a list", "raw": content}

    except json.JSONDecodeError:
        return {"success": False, "error": "JSON parse error", "raw": content}
    except Exception as e:
        return {"success": False, "error": str(e)}
