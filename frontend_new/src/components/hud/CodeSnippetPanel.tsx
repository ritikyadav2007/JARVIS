import React from 'react';

export const CodeSnippetPanel: React.FC = () => {
  return (
    <div className="hud-panel panel-code" aria-label="Code Snippet Preview">
      <div className="hud-panel-header">
        <span className="hud-panel-title">
          CODE SNIPPET
          <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--cyan)' }}>
            Python
          </span>
        </span>
        <div className="hud-panel-controls">
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="code-editor-box">
        <pre>
          <code>
            <div><span className="code-line-num">1</span> <span className="code-kw">import</span> psutil</div>
            <div><span className="code-line-num">2</span> <span className="code-kw">def</span> <span className="code-fn">get_system_health</span>():</div>
            <div><span className="code-line-num">3</span>     <span className="code-kw">return</span> &#123;</div>
            <div><span className="code-line-num">4</span>         <span className="code-str">"cpu"</span>: psutil.cpu_percent(),</div>
            <div><span className="code-line-num">5</span>         <span className="code-str">"ram"</span>: psutil.virtual_memory().percent</div>
            <div><span className="code-line-num">6</span>     &#125;</div>
            <div><span className="code-line-num">7</span> </div>
          </code>
        </pre>
      </div>
    </div>
  );
};

