import React, { useState } from 'react';
import './App.css';
import StrengthCard from './components/StrengthCard';
import SuggestionCard from './components/SuggestionCard';
import ErrorMessage from './components/ErrorMessage';

// 语言配置
const languages = {
  zh: {
    // Header
    appTitle: "📋 Resume Analyzer",
    
    // Navigation
    uploadTab: "📄 上传简历",
    matchTab: "🎯 职位匹配",
    feedbackTab: "💡 简历反馈",
    
    // Upload Section
    uploadTitle: "📄 上传简历",
    selectFile: "选择PDF格式简历：",
    uploadAndParse: "上传并解析",
    supportedFormat: "📋 支持的文件格式：PDF",
    sizeLimit: "📝 建议文件大小不超过10MB",
    fileReadable: "🔍 确保文件内容清晰可读",
    
    // Resume Display
    parsedResumeTitle: "📄 已解析的简历内容",
    nameLabel: "👤 姓名",
    emailLabel: "📧 邮箱",
    phoneLabel: "📱 电话",
    skillsLabel: "🔧 技能",
    experienceLabel: "💼 工作经验",
    educationLabel: "🎓 教育背景",
    rawTextLabel: "📝 原始文本",
    
    // Match Section
    matchTitle: "🎯 职位匹配分析",
    jobTitleLabel: "职位名称（获取技能建议）：",
    jobTitlePlaceholder: "例如：数据科学家",
    getSkillSuggestions: "获取技能建议",
    selectSkills: "选择相关技能（将自动添加到职位描述中）：",
    jdLabel: "职位描述：",
    jdPlaceholder: "请粘贴完整的职位描述...\n\n提示：您可以先输入职位名称获取技能建议，选择的技能会自动添加到这里。",
    startMatching: "开始匹配分析",
    
    // Feedback Section
    feedbackTitle: "💡 简历反馈",
    generateFeedback: "获取详细反馈",
    
    // Results
    resultTitle: "📈 分析结果",
    matchResult: "📊 匹配结果",
    matchScore: "匹配评分:",
    matchedSkills: "✅ 匹配的技能:",
    missingSkills: "❌ 缺失的技能:",
    dimensionScores: "📈 维度评分:",
    coreStrengths: "💪 核心优势",
    improvements: "🔧 改进建议",
    
    // Status Messages
    parsing: "⏳ 正在解析简历...",
    parseSuccess: "✅ 简历解析成功",
    parseFailed: "❌ 简历解析失败",
    gettingSkills: "⏳ 获取技能建议中...",
    skillsSuccess: "✅ 技能建议获取成功",
    skillsFailed: "❌ 获取技能建议失败",
    noSkillSuggestions: "❌ 无技能建议",
    matching: "⏳ 正在匹配职位...",
    matchSuccess: "✅ 匹配分析完成",
    matchFailed: "❌ 匹配分析失败",
    generatingFeedback: "⏳ 正在生成反馈...",
    feedbackSuccess: "✅ 反馈生成完成",
    feedbackFailed: "❌ 获取反馈失败",
    
    // Error Messages
    selectPDF: "请选择一个PDF文件",
    pdfOnly: "只支持PDF文件格式",
    parseError: "无法解析简历。请确保文件格式正确且未损坏。",
    enterJobTitle: "请输入职位名称",
    skillSuggestionError: "无法获取技能建议。请稍后重试。",
    noSkillSuggestions: "未找到相关职位的技能建议",
    uploadFirst: "请先上传并解析简历",
    enterJD: "请输入职位描述",
    matchError: "职位匹配分析失败，请稍后重试",
    feedbackError: "获取反馈时发生错误"
  },
  en: {
    // Header
    appTitle: "📋 Resume Analyzer",
    
    // Navigation
    uploadTab: "📄 Upload Resume",
    matchTab: "🎯 Job Matching",
    feedbackTab: "💡 Resume Feedback",
    
    // Upload Section
    uploadTitle: "📄 Upload Resume",
    selectFile: "Select PDF Resume:",
    uploadAndParse: "Upload and Parse",
    supportedFormat: "📋 Supported Format: PDF",
    sizeLimit: "📝 Recommended file size under 10MB",
    fileReadable: "🔍 Ensure file content is clear and readable",
    
    // Resume Display
    parsedResumeTitle: "📄 Parsed Resume Content",
    nameLabel: "👤 Name",
    emailLabel: "📧 Email",
    phoneLabel: "📱 Phone",
    skillsLabel: "🔧 Skills",
    experienceLabel: "💼 Work Experience",
    educationLabel: "🎓 Education",
    rawTextLabel: "📝 Raw Text",
    
    // Match Section
    matchTitle: "🎯 Job Matching Analysis",
    jobTitleLabel: "Job Title (Get Skill Suggestions):",
    jobTitlePlaceholder: "e.g.: Data Scientist",
    getSkillSuggestions: "Get Skill Suggestions",
    selectSkills: "Select Relevant Skills (Will be automatically added to job description):",
    jdLabel: "Job Description:",
    jdPlaceholder: "Please paste the complete job description...\n\nTip: You can first enter a job title to get skill suggestions, selected skills will be automatically added here.",
    startMatching: "Start Matching Analysis",
    
    // Feedback Section
    feedbackTitle: "💡 Resume Feedback",
    generateFeedback: "Get Detailed Feedback",
    
    // Results
    resultTitle: "📈 Analysis Results",
    matchResult: "📊 Matching Results",
    matchScore: "Match Score:",
    matchedSkills: "✅ Matched Skills:",
    missingSkills: "❌ Missing Skills:",
    dimensionScores: "📈 Dimension Scores:",
    coreStrengths: "💪 Core Strengths",
    improvements: "🔧 Improvement Suggestions",
    
    // Status Messages
    parsing: "⏳ Parsing resume...",
    parseSuccess: "✅ Resume parsed successfully",
    parseFailed: "❌ Resume parsing failed",
    gettingSkills: "⏳ Getting skill suggestions...",
    skillsSuccess: "✅ Skill suggestions obtained successfully",
    skillsFailed: "❌ Failed to get skill suggestions",
    noSkillSuggestions: "❌ No skill suggestions",
    matching: "⏳ Matching job position...",
    matchSuccess: "✅ Matching analysis completed",
    matchFailed: "❌ Matching analysis failed",
    generatingFeedback: "⏳ Generating feedback...",
    feedbackSuccess: "✅ Feedback generated successfully",
    feedbackFailed: "❌ Failed to get feedback",
    
    // Error Messages
    selectPDF: "Please select a PDF file",
    pdfOnly: "Only PDF format is supported",
    parseError: "Unable to parse resume. Please ensure the file format is correct and not corrupted.",
    enterJobTitle: "Please enter job title",
    skillSuggestionError: "Unable to get skill suggestions. Please try again later.",
    noSkillSuggestions: "No skill suggestions found for this position",
    uploadFirst: "Please upload and parse resume first",
    enterJD: "Please enter job description",
    matchError: "Job matching analysis failed, please try again later",
    feedbackError: "Error occurred while getting feedback"
  }
};

// 简历显示组件
const ResumeDisplay = ({ resume, lang }) => {
  const t = languages[lang];
  
  if (!resume) return null;

  return (
    <div className="resume-display" style={{
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>{t.parsedResumeTitle}</h3>
      <div className="resume-content">
        {resume.name && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.nameLabel}</h4>
            <p style={{ color: '#64748b' }}>{resume.name}</p>
          </div>
        )}
        {resume.email && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.emailLabel}</h4>
            <p style={{ color: '#64748b' }}>{resume.email}</p>
          </div>
        )}
        {resume.phone && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.phoneLabel}</h4>
            <p style={{ color: '#64748b' }}>{resume.phone}</p>
          </div>
        )}
        {resume.skills && resume.skills.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.skillsLabel}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {resume.skills.map((skill, index) => (
                <span key={index} style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem'
                }}>{skill}</span>
              ))}
            </div>
          </div>
        )}
        {resume.experience && resume.experience.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.experienceLabel}</h4>
            {resume.experience.map((exp, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ color: '#1e293b', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {exp}
                </p>
              </div>
            ))}
          </div>
        )}
        {resume.education && resume.education.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.educationLabel}</h4>
            {resume.education.map((edu, index) => (
              <div key={index} style={{ 
                marginBottom: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{ color: '#1e293b', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {edu}
                </p>
              </div>
            ))}
          </div>
        )}
        {resume.raw_text && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#2563eb', marginBottom: '0.5rem' }}>{t.rawTextLabel}</h4>
            <div style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              padding: '1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{resume.raw_text}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [parsedResume, setParsedResume] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [error, setError] = useState(null);

  const t = languages[language]; // 当前语言的翻译

  // 语言切换函数
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // 切换标签页时清理内容
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setStatus('');
    // 清理结果，避免标签页切换时显示错误的内容
    if (tab === 'upload') {
      // 上传页面不需要清理result，因为简历信息需要保留
    } else if (tab === 'match') {
      // 匹配页面清理反馈结果
      if (result?.type === 'feedback') {
        setResult(null);
      }
    } else if (tab === 'feedback') {
      // 反馈页面清理匹配结果
      if (result?.type === 'match') {
        setResult(null);
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.fileInput.files[0];
    if (!file) {
      setError(t.selectPDF);
      return;
    }
    if (!file.type.includes('pdf')) {
      setError(t.pdfOnly);
      return;
    }
    setStatus(t.parsing);
    setError(null);
    setParsedResume(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", language);
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
      setStatus(t.parseSuccess);
    } catch (error) {
      console.error("Resume parsing error:", error);
      setError(t.parseError);
      setStatus(t.parseFailed);
      setParsedResume(null);
    }
  };

  const handleSuggestSkills = async () => {
    if (!jobTitle.trim()) {
      setError(t.enterJobTitle);
      return;
    }
    setStatus(t.gettingSkills);
    setError(null);
    setSuggestedSkills([]);
    try {
      const res = await fetch("/api/suggest-skills", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_title: jobTitle,lang: language})
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
        setStatus(t.skillsSuccess);
      } else {
        setError(t.noSkillSuggestions);
        setStatus(t.noSkillSuggestions);
      }
    } catch (error) {
      console.error("Skills suggestion error:", error);
      setError(error.message || t.skillSuggestionError);
      setStatus(t.skillsFailed);
    }
  };

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => {
      const isSelected = prev.includes(skill);
      let newSkills;
      
      if (isSelected) {
        // 取消选择
        newSkills = prev.filter(s => s !== skill);
        // 从JD文本中移除技能
        const skillPattern = new RegExp(`\\n?需要技能\\s*[：:]?\\s*${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
        const skillPatternEn = new RegExp(`\\n?Required skill\\s*[：:]?\\s*${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
        setJdText(prevJd => prevJd.replace(skillPattern, '').replace(skillPatternEn, ''));
      } else {
        // 选择技能
        newSkills = [...prev, skill];
        // 将技能添加到JD文本中
        const skillText = language === 'zh' ? `\n需要技能: ${skill}` : `\nRequired skill: ${skill}`;
        setJdText(prevJd => prevJd.trim() + skillText);
      }
      
      return newSkills;
    });
  };

  const handleMatchJD = async () => {
    if (!parsedResume) {
      setError(t.uploadFirst);
      return;
    }
    if (!jdText.trim()) {
      setError(t.enterJD);
      return;
    }
    setStatus(t.matching);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/match-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: parsedResume,
          jd: jdText,
          confirmed_skills: selectedSkills,
          lang: language
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "匹配分析失败");
      }
      setResult({
        type: 'match',
        summary: json.summary || '',
        match_score: json.gpt_score || 0,
        dimensions: json.dimensions || {},
        matched_skills: json.matched_skills || [],
        missing_skills: json.missing_skills || []
      });
      setStatus(t.matchSuccess);
    } catch (error) {
      console.error("JD matching error:", error);
      setError(error.message || t.matchError);
      setStatus(t.matchFailed);
    }
  };

  const handleGetFeedback = async () => {
    if (!parsedResume) {
      setError(t.uploadFirst);
      return;
    }
    setStatus(t.generatingFeedback);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: parsedResume,lang: language}),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "生成反馈失败");
      }
      setResult({
        type: 'feedback',
        strengths: json.data.strengths || [],
        suggestions: json.data.suggestions || []
      });
      setStatus(t.feedbackSuccess);
    } catch (error) {
      console.error("Feedback error:", error);
      setError(error.message || t.feedbackError);
      setStatus(t.feedbackFailed);
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
            <h3>{t.matchResult}</h3>
            <div className="match-summary">
              <p>{summary}</p>
              <div className="score-section">
                <p><strong>{t.matchScore}</strong> {match_score}/100</p>
              </div>
              <div className="skills-section">
                <h4>{t.matchedSkills}</h4>
                <ul>
                  {matched_skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
                <h4>{t.missingSkills}</h4>
                <ul>
                  {missing_skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
              <div className="dimensions">
                <h4>{t.dimensionScores}</h4>
                {Object.entries(dimensions).map(([key, value], index) => (
                  <p key={index}><strong>{key}:</strong> {value}</p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'feedback':
        const {
          strengths = [],
          suggestions = []
        } = result;
        return (
          <div className="feedback-grid">
            <div className="strengths-section">
              <h3 className="section-title">{t.coreStrengths}</h3>
              <div className="strengths-grid">
                {strengths.map((strength, index) => (
                  <StrengthCard key={index} strength={strength} />
                ))}
              </div>
            </div>
            <div className="suggestions-section">
              <h3 className="section-title">{t.improvements}</h3>
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard key={index} suggestion={suggestion} lang={language} />
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
        <h1>{t.appTitle}</h1>
        <div className="language-toggle" style={{ 
          position: 'absolute', 
          right: '1rem', 
          top: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <button 
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            🌐 {language === 'zh' ? 'English' : '中文'}
          </button>
        </div>
        <div className="status-bar">{status}</div>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'upload' ? 'active' : ''} 
          onClick={() => handleTabChange('upload')}
        >
          {t.uploadTab}
        </button>
        <button 
          className={activeTab === 'match' ? 'active' : ''} 
          onClick={() => handleTabChange('match')}
        >
          {t.matchTab}
        </button>
        <button 
          className={activeTab === 'feedback' ? 'active' : ''} 
          onClick={() => handleTabChange('feedback')}
        >
          {t.feedbackTab}
        </button>
      </nav>

      <main className="app-content">
        {error && <ErrorMessage message={error} />}

        {activeTab === 'upload' && (
          <section className="upload-section">
            <h2>{t.uploadTitle}</h2>
            <form id="uploadForm" onSubmit={handleFileUpload}>
              <div className="form-group">
                <label htmlFor="fileInput">{t.selectFile}</label>
                <input 
                  type="file" 
                  id="fileInput" 
                  name="fileInput" 
                  accept=".pdf" 
                  required 
                  onChange={() => setError(null)} 
                />
              </div>
              <button type="submit">{t.uploadAndParse}</button>
            </form>
            
            {/* 显示解析的简历 */}
            {parsedResume && <ResumeDisplay resume={parsedResume} lang={language} />}
            
            {!parsedResume && (
              <div className="upload-hint">
                <p>{t.supportedFormat}</p>
                <p>{t.sizeLimit}</p>
                <p>{t.fileReadable}</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'match' && (
          <section className="match-section">
            <h2>{t.matchTitle}</h2>
            
            {/* 技能建议功能合并到匹配页面 */}
            <div className="form-group">
              <label htmlFor="jobTitle">{t.jobTitleLabel}</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => { setJobTitle(e.target.value); setError(null); }}
                  placeholder={t.jobTitlePlaceholder}
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={handleSuggestSkills}
                  style={{ flexShrink: 0 }}
                >
                  {t.getSkillSuggestions}
                </button>
              </div>
            </div>

            {/* 技能选择区域 */}
            {suggestedSkills.length > 0 && (
              <div className="form-group">
                <label>{t.selectSkills}</label>
                <div className="skills-grid">
                  {suggestedSkills.map(skill => (
                    <label key={skill} className="skill-item">
                      <input 
                        type="checkbox" 
                        checked={selectedSkills.includes(skill)} 
                        onChange={() => handleSkillToggle(skill)} 
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="jdText">{t.jdLabel}</label>
              <textarea
                id="jdText"
                value={jdText}
                onChange={(e) => { setJdText(e.target.value); setError(null); }}
                placeholder={t.jdPlaceholder}
                rows="10"
              />
              <button onClick={handleMatchJD}>{t.startMatching}</button>
            </div>
          </section>
        )}

        {activeTab === 'feedback' && (
          <section className="feedback-section">
            <h2>{t.feedbackTitle}</h2>
            <button onClick={handleGetFeedback} className="generate-feedback-btn">
              {t.generateFeedback}
            </button>
          </section>
        )}

        {result && (
          <section className="result-section">
            <h2>{t.resultTitle}</h2>
            {renderResult()}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;