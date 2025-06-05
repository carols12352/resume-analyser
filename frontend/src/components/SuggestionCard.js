// import React from 'react';

// const SuggestionCard = ({ suggestion }) => {
//   const { issue, recommendation, example, resource } = suggestion;
  
//   return (
//     <div className="suggestion-card">
//       <div className="suggestion-header">
//         <span className="suggestion-icon">🔧</span>
//         <h4>{issue}</h4>
//       </div>
//       <div className="suggestion-content">
//         <p><strong>建议：</strong>{recommendation}</p>
//         <p><strong>示例：</strong>{example}</p>
//         <p><strong>资源：</strong><a href={resource} target="_blank" rel="noopener noreferrer">{resource}</a></p>
//       </div>
//     </div>
//   );
// };

// export default SuggestionCard; 
import React from 'react';

// 语言配置
const suggestionLabels = {
  zh: {
    recommendation: "建议：",
    example: "示例：",
    resource: "资源："
  },
  en: {
    recommendation: "Recommendation:",
    example: "Example:",
    resource: "Resource:"
  }
};

const SuggestionCard = ({ suggestion, lang = 'zh' }) => {
  const { issue, recommendation, example, resource } = suggestion;
  const labels = suggestionLabels[lang];
  
  return (
    <div className="suggestion-card">
      <div className="suggestion-header">
        <span className="suggestion-icon">🔧</span>
        <h4>{issue}</h4>
      </div>
      <div className="suggestion-content">
        <p><strong>{labels.recommendation}</strong>{recommendation}</p>
        <p><strong>{labels.example}</strong>{example}</p>
        <p><strong>{labels.resource}</strong><a href={resource} target="_blank" rel="noopener noreferrer">{resource}</a></p>
      </div>
    </div>
  );
};

export default SuggestionCard;