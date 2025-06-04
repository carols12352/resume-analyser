def compute_weighted_score(dimensions: dict, gpt_score: int) -> int:
    """
    根据维度评分和 GPT 原始分数计算最终加权评分
    """
    weights = {
        "education_quality": 0.2,
        "major_relevance": 0.2,
        "skill_match": 0.3,
        "experience_relevance": 0.2,
        "soft_skills": 0.1,
    }

    weighted_score = sum(dimensions.get(k, 0) * w for k, w in weights.items())
    final_score = round((weighted_score + gpt_score) / 2)
    return final_score
