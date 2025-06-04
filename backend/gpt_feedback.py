import json
from backend import get_client

client = get_client()

def get_resume_feedback(resume_data: dict) -> dict:
    """
    使用 GPT 对简历进行分析，输出统一格式的优点和改进建议。
    """
    prompt = f"""
You are a professional resume reviewer.

Given the structured resume below, analyze its strengths and provide constructive improvement suggestions.
You must give vaild and accurate conclusions, which means you cannot make up websites and pages that does not exist
You may give pages or videos(such as youtube) that is best based on the missing skills
You must follow **this JSON format** strictly:

{{
  "strengths": ["List of 2–4 concrete strengths about this resume"],
  "suggestions": [
    {{
      "issue": "Briefly state the issue",
      "recommendation": "Clearly describe how to improve it",
      "example": "Provide an example of improved phrasing or content",
      "resource": "Recommend a free website or article that helps improve this area"
    }},
    ...
  ]
}}

Here is the resume data (structured):
{json.dumps(resume_data, ensure_ascii=False)}

Now generate your response in valid JSON only. Be specific, practical, and helpful for a student who wants to improve their resume for tech/data-related jobs.
"""


    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You help people improve their resumes with clear, structured feedback."},
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
