# import json
# from backend import get_client

# client = get_client()

# def get_resume_feedback(resume_data: dict,lang="en") -> dict:
#     """
#     使用 GPT 对简历进行分析，输出统一格式的优点和改进建议。
#     """

#     if lang=="zh" :
#         prompt = f"""
# 你是一位专业的简历评估专家。

# 请根据以下结构化简历数据，总结其优点，并给出具体的改进建议。你必须使用以下 JSON 格式返回内容，不要添加任何说明或解释：

# {{
#   "strengths": ["列出 2–4 个简历中的优势"],
#   "suggestions": [
#     {{
#       "issue": "简要描述问题",
#       "recommendation": "明确给出改进方法",
#       "example": "提供改进后的示例",
#       "resource": "推荐一个免费的网站或资料来帮助改进该方面"
#     }}
#   ]
# }}

# 简历数据如下：
# {json.dumps(resume_data, ensure_ascii=False)}
# """

#     else:
#       prompt = f"""
# You are a professional resume reviewer.

# Given the structured resume below, analyze its strengths and provide constructive improvement suggestions.
# You must give vaild and accurate conclusions, which means you cannot make up websites and pages that does not exist
# You may give pages or videos(such as youtube) that is best based on the missing skills
# You must follow **this JSON format** strictly:

# {{
#   "strengths": ["List of 2–4 concrete strengths about this resume"],
#   "suggestions": [
#     {{
#       "issue": "Briefly state the issue",
#       "recommendation": "Clearly describe how to improve it",
#       "example": "Provide an example of improved phrasing or content",
#       "resource": "Recommend a free website or article that helps improve this area"
#     }},
#     ...
#   ]
# }}

# Here is the resume data (structured):
# {json.dumps(resume_data, ensure_ascii=False)}

# Now generate your response in valid JSON only. Be specific, practical, and helpful for a student who wants to improve their resume for tech/data-related jobs.
# """
#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "system", "content": "You help people improve their resumes with clear, structured feedback."},
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.2,
#             max_tokens=1000
#         )
#         content = response.choices[0].message.content.strip()
#         parsed = json.loads(content)
#         return {"success": True, "data": parsed}

#     except json.JSONDecodeError:
#         return {"success": False, "error": "JSON parse error", "raw": content}

#     except Exception as e:
#         return {"success": False, "error": str(e)}
import json
from backend import get_client

client = get_client()

def get_resume_feedback(resume_data: dict, lang="en") -> dict:
    """
    使用 GPT 对简历进行分析，输出统一格式的优点和改进建议，支持中英文语言切换。
    """

    # System prompt 根据语言切换
    system_msg = (
        "你是一位专业的中文简历顾问，擅长提供结构化反馈和优化建议。你的回答必须使用中文。"
        if lang == "zh"
        else "You help people improve their resumes with clear, structured feedback. Always respond in English."
    )

    # User prompt 构造
    if lang == "zh":
        prompt = f"""
请用中文回答以下内容：
你是一位专业的简历评估专家。

请根据以下结构化简历数据，总结其优点，并给出具体的改进建议。你必须使用以下 JSON 格式返回内容，不要添加任何说明或解释：

{{
  "strengths": ["列出 3–5 个简历中的优势"],
  "suggestions": [
    {{
      "issue": "简要描述问题",
      "recommendation": "明确给出改进方法",
      "example": "提供改进后的示例",
      "resource": "推荐一个免费的网站或资料来帮助改进该方面"
    }}
  ]
}}

简历数据如下：
{json.dumps(resume_data, ensure_ascii=False)}
"""
    else:
        prompt = f"""
You are a professional resume reviewer.

Please respond in English.

Given the structured resume below, analyze its strengths and provide constructive improvement suggestions.
You must give valid and accurate conclusions — do not make up websites or resources.
You may recommend pages or videos (e.g., YouTube) based on missing skills.
You must follow this JSON format strictly:

{{
  "strengths": ["List of 3–5 concrete strengths about this resume"],
  "suggestions": [
    {{
      "issue": "Briefly state the issue",
      "recommendation": "Clearly describe how to improve it",
      "example": "Provide an example of improved phrasing or content",
      "resource": "Recommend a free website or article that helps improve this area"
    }}
  ]
}}

Here is the resume data (structured):
{json.dumps(resume_data, ensure_ascii=False)}

Only return valid JSON.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )
        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)
        return {"success": True, "data": parsed}

    except json.JSONDecodeError:
        return {"success": False, "error": "JSON parse error", "raw": content}

    except Exception as e:
        return {"success": False, "error": str(e)}
