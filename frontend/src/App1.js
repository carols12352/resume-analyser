import React, { useState } from 'react';
import './App.css';
import StrengthCard from './components/StrengthCard';
import SuggestionCard from './components/SuggestionCard';
import ErrorMessage from './components/ErrorMessage';

const FeedbackCard = ({ type, title, content, icon }) => (
  <div className={`feedback-card ${type}`}>
    <div className="feedback-icon">{icon}</div>
    <h3>{title}</h3>
    <div className="feedback-content">{content}</div>
  </div>
);

function App() {
  const [parsedResume, setParsedResume] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.fileInput.files[0];
    if (!file) {
      setError("请选择一个PDF文件");
      return;
    }
    if (!file.type.includes('pdf')) {
      setError("只支持PDF文件格式");
      return;
    }
    setStatus("⏳ 正在解析简历...");
    setError(null);
    setParsedResume(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }
      setParsedResume(json);
      setStatus("✅ 简历解析成功");
    } catch (error) {
      console.error("Resume parsing error:", error);
      setError("无法解析简历。请确保文件格式正确且未损坏。");
      setStatus("❌ 简历解析失败");
      setParsedResume(null);
    }
  };

  const handleSuggestSkills = async () => {
    if (!jobTitle.trim()) {
      setError("请输入职位名称");
      return;
    }
    setStatus("⏳ 获取技能建议中...");
    setError(null);
    setSuggestedSkills([]);
    try {
      const res = await fetch("/api/suggest-skills", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_title: jobTitle })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "获取技能建议失败");
      }
      if (json.suggested_skills && json.suggested_skills.length > 0) {
        setSuggestedSkills(json.suggested_skills);
        setStatus("✅ 技能建议获取成功");
      } else {
        setError("未找到相关职位的技能建议");
        setStatus("❌ 无技能建议");
      }
    } catch (error) {
      console.error("Skills suggestion error:", error);
      setError(error.message || "无法获取技能建议。请稍后重试。");
      setStatus("❌ 获取技能建议失败");
    }
  };

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleMatchJD = async () => {
    if (!parsedResume) {
      setError("请先上传并解析简历");
      return;
    }
    if (!jdText.trim()) {
      setError("请输入职位描述");
      return;
    }
    setStatus("⏳ 正在匹配职位...");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/match-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: parsedResume,
          jd: jdText,
          confirmed_skills: selectedSkills
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json(); // For match-jd, fields are at the top level of json
      if (!json.success) { // Check only for success, not json.data
        throw new Error(json.error || "匹配分析失败");
      }
      setResult({
        type: 'match',
        summary: json.summary || '',
        match_score: json.gpt_score || 0, // map gpt_score to match_score
        dimensions: json.dimensions || {},
        matched_skills: json.matched_skills || [],
        missing_skills: json.missing_skills || []
        // final_score from json.final_score is not explicitly used in renderResult for 'match' currently
      });
      setStatus("✅ 匹配分析完成");
    } catch (error) {
      console.error("JD matching error:", error);
      setError(error.message || "职位匹配分析失败，请稍后重试");
      setStatus("❌ 匹配分析失败");
    }
  };

  const handleGetFeedback = async () => {
    if (!parsedResume) {
      setError("请先上传并解析简历");
      return;
    }
    setStatus("⏳ 正在生成反馈...");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: parsedResume })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success || !json.data) { // For feedback, data is nested under json.data
        throw new Error(json.error || "生成反馈失败");
      }
      setResult({
        type: 'feedback',
        strengths: json.data.strengths || [], // Explicitly access and default
        suggestions: json.data.suggestions || [] // Explicitly access and default
      });
      setStatus("✅ 反馈生成完成");
    } catch (error) {
      console.error("Feedback error:", error);
      setError(error.message || "获取反馈时发生错误");
      setStatus("❌ 获取反馈失败");
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (result.type) {
      case 'match':
        const {
          summary = '',
          match_score = 0,
          dimensions = {},
          matched_skills = [],
          missing_skills = []
        } = result;
        return (
          <div className="match-result">
            <h3>匹配结果</h3>
            <div className="match-summary">
              <p>{summary}</p>
              <div className="score-section">
                <p>匹配评分: {match_score}/100</p>
              </div>
              <div className="skills-section">
                <h4>匹配的技能:</h4>
                <ul>
                  {matched_skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
                <h4>缺失的技能:</h4>
                <ul>
                  {missing_skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
              <div className="dimensions">
                <h4>维度评分:</h4>
                {Object.entries(dimensions).map(([key, value], index) => (
                  <p key={index}>{key}: {value}</p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'feedback':
        const {
          strengths = [],
          suggestions = []
        } = result; // result already contains { type: 'feedback', strengths: [], suggestions: [] }
        return (
          <div className="feedback-grid">
            <div className="strengths-section">
              <h3 className="section-title">核心优势</h3>
              <div className="strengths-grid">
                {strengths.map((strength, index) => (
                  <StrengthCard key={index} strength={strength} />
                ))}
              </div>
            </div>
            <div className="suggestions-section">
              <h3 className="section-title">改进建议</h3>
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard key={index} suggestion={suggestion} />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Resume Analyzer</h1>
        <div className="status-bar">{status}</div>
      </header>

      <nav className="app-nav">
        <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>上传简历</button>
        <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>技能建议</button>
        <button className={activeTab === 'match' ? 'active' : ''} onClick={() => setActiveTab('match')}>职位匹配</button>
        <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>简历反馈</button>
      </nav>

      <main className="app-content">
        {error && <ErrorMessage message={error} />}

        {activeTab === 'upload' && (
          <section className="upload-section">
            <h2>上传简历</h2>
            <form id="uploadForm" onSubmit={handleFileUpload}>
              <div className="form-group">
                <label htmlFor="fileInput">选择PDF格式简历：</label>
                <input type="file" id="fileInput" name="fileInput" accept=".pdf" required onChange={() => setError(null)} />
              </div>
              <button type="submit">上传并解析</button>
            </form>
            {!parsedResume && (
              <div className="upload-hint">
                <p>📋 支持的文件格式：PDF</p>
                <p>📝 建议文件大小不超过10MB</p>
                <p>🔍 确保文件内容清晰可读</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'skills' && (
          <section className="skills-section">
            <h2>获取技能建议</h2>
            <div className="form-group">
              <label htmlFor="jobTitle">职位名称：</label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); setError(null); }}
                placeholder="例如：数据科学家"
              />
              <button onClick={handleSuggestSkills}>获取建议</button>
            </div>
            {suggestedSkills.length > 0 ? (
              <div className="skills-grid">
                {suggestedSkills.map(skill => (
                  <label key={skill} className="skill-item">
                    <input type="checkbox" checked={selectedSkills.includes(skill)} onChange={() => handleSkillToggle(skill)} />
                    {skill}
                  </label>
                ))}
              </div>
            ) : !error && (
              <div className="skills-hint">
                <p>🎯 输入职位名称获取相关技能建议</p>
                <p>💡 建议使用准确的职位名称</p>
                <p>🔄 可以多次尝试不同的职位名称</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'match' && (
          <section className="match-section">
            <h2>职位匹配分析</h2>
            <div className="form-group">
              <label htmlFor="jdText">职位描述：</label>
              <textarea
                id="jdText"
                value={jdText}
                onChange={(e) => { setJdText(e.target.value); setError(null); }}
                placeholder="请粘贴完整的职位描述..."
                rows="8"
              />
              <button onClick={handleMatchJD}>开始匹配分析</button>
            </div>
          </section>
        )}

        {activeTab === 'feedback' && (
          <section className="feedback-section">
            <h2>简历反馈</h2>
            <button onClick={handleGetFeedback} className="generate-feedback-btn">获取详细反馈</button>
          </section>
        )}

        {result && (
          <section className="result-section">
            <h2>分析结果</h2>
            {renderResult()}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
 