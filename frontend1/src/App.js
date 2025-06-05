import React, { useState } from 'react';
import './App.css';

function App() {
  const [parsedResume, setParsedResume] = useState(null);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [jdText, setJdText] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatus('Parsing resume...');

    try {
      const response = await fetch('/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setParsedResume(data);
      setResult(JSON.stringify(data, null, 2));
      setStatus('✅ Resume parsed.');
    } catch (error) {
      setStatus('❌ Error parsing resume.');
      console.error('Error:', error);
    }
  };

  const handleSuggestSkills = async () => {
    const title = document.getElementById('jobTitle').value;
    if (!title) return;
    
    setStatus('Fetching suggested skills...');

    try {
      const response = await fetch('/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job_title: title })
      });

      const data = await response.json();
      if (data.suggested_skills) {
        setSuggestedSkills(data.suggested_skills);
        setStatus('✅ Suggested skills loaded.');
      } else {
        setStatus('❌ Failed to load skills.');
      }
    } catch (error) {
      setStatus('❌ Error fetching skills.');
      console.error('Error:', error);
    }
  };

  const handleSkillChange = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });

    // Update JD text with selected skills
    const baseJD = jdText.split('Confirmed required skills:')[0].trim();
    const newJD = selectedSkills.length > 0 
      ? `${baseJD}\n\nConfirmed required skills: ${selectedSkills.join(', ')}`
      : baseJD;
    setJdText(newJD);
  };

  const handleMatchJD = async () => {
    if (!parsedResume || !jdText) return;

    setStatus('Matching with JD...');

    try {
      const response = await fetch('/match-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: parsedResume,
          jd: jdText,
          confirmed_skills: selectedSkills
        })
      });

      const data = await response.json();

      if (data.error) {
        setResult(JSON.stringify(data, null, 2));
        setStatus('❌ Matching failed.');
        return;
      }

      const formatted = `
🔎 Match Summary: ${data.summary}
📊 GPT Score: ${data.gpt_score}/100
🧠 Final Score (Weighted): ${data.final_score}/100

✅ Matched Skills:
${data.matched_skills?.map(s => "  - " + s).join("\n") || "  (None)"}

❌ Missing Skills:
${data.missing_skills?.map(s => "  - " + s).join("\n") || "  (None)"}

📐 Dimension Scores:
${data.dimensions ? Object.entries(data.dimensions).map(([key, val]) => `  - ${key}: ${val}`).join("\n") : "  (None)"}
`;

      setResult(formatted);
      setStatus('✅ Matching complete.');
    } catch (error) {
      setStatus('❌ Error matching JD.');
      console.error('Error:', error);
    }
  };

  const handleGetFeedback = async () => {
    if (!parsedResume) return;
    setStatus('Generating feedback...');

    try {
      const response = await fetch('/get-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: parsedResume })
      });

      const data = await response.json();
      if (data.success) {
        const { strengths, suggestions } = data.data;

        const suggestionText = suggestions.map(s =>
          `🔧 *${s.issue}*\n🧠 Recommendation: ${s.recommendation}\n💡 Example: ${s.example}\n🌐 Resource: ${s.resource}`
        ).join("\n\n");

        setResult(`
💪 Strengths:
${strengths.map(s => "  - " + s).join("\n")}

🛠️ Suggestions:
${suggestionText}
        `);
        setStatus('✅ Feedback ready.');
      } else {
        setStatus('❌ Failed to get feedback.');
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setStatus('❌ Error getting feedback.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <h1>Resume Parser & JD Matcher</h1>

      <div className="block">
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            Choose PDF Resume File:
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              required
            />
          </label>
        </form>
      </div>

      <div className="block">
        <label>
          Enter Job Title for Suggested Skills:
          <input
            type="text"
            id="jobTitle"
            placeholder="e.g., Data Scientist"
          />
        </label>
        <button onClick={handleSuggestSkills}>
          Suggest Skills
        </button>
        <div className="skills-container">
          {suggestedSkills.map((skill, index) => (
            <label key={index} className="skill-label">
              <input
                type="checkbox"
                name="skills"
                value={skill}
                checked={selectedSkills.includes(skill)}
                onChange={() => handleSkillChange(skill)}
              />
              {skill}
            </label>
          ))}
        </div>
      </div>

      <div className="block">
        <button onClick={handleGetFeedback}>
          Get Feedback
        </button>
      </div>

      <div className="block">
        <label>
          Paste Job Description:
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows="8"
            placeholder="Enter job description here..."
          />
        </label>
        <button onClick={handleMatchJD}>
          Match Resume with JD
        </button>
      </div>

      <div className="status">{status}</div>
      <h3>Result</h3>
      <pre className="result">{result}</pre>
    </div>
  );
}

export default App;
