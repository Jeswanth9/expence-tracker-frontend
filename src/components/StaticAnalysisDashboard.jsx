import { useState, useEffect } from 'react';
import '../styles/StaticAnalysisDashboard.css';

function StaticAnalysisDashboard() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setIsLoading(true);
        const result = await scanProjectFiles();
        setAnalysisResult(result);
      } catch (exception) {
        setErrorMessage(exception.message || 'Unable to complete codebase analysis');
      } finally {
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, []);

  const scanProjectFiles = async () => {
    // Load JSX components from the components directory
    const jsxComponents = import.meta.glob('../components/*.jsx', { as: 'raw' });
    const jsFiles = import.meta.glob('../utils/*.js', { as: 'raw' });
    const mainFiles = import.meta.glob('../{App,main,index}.jsx', { as: 'raw' });

    const allModules = { ...jsxComponents, ...jsFiles, ...mainFiles };

    let codeLineCount = 0;
    let fileCount = 0;
    let functionDefinitions = 0;
    let reactComponentCount = 0;
    let importStatements = 0;
    let complexityData = [];
    let fileSizeData = [];

    // Process each discovered file
    for (const [filePath, loader] of Object.entries(allModules)) {
      try {
        const fileContent = await loader();
        if (fileContent && typeof fileContent === 'string') {
          fileCount++;
          const lineCount = fileContent.split('\n').length;
          codeLineCount += lineCount;

          // Analyze function declarations
          const regularFunctions = (fileContent.match(/function\s+\w+/g) || []).length;
          const arrowFunctionExprs = (fileContent.match(/const\s+\w+\s*=\s*\(\) => /g) || []).length;
          const totalFuncs = regularFunctions + arrowFunctionExprs;
          functionDefinitions += totalFuncs;

          // Identify React components
          if (filePath.includes('.jsx')) {
            reactComponentCount++;
          }

          // Count import declarations
          const importCount = (fileContent.match(/^import\s+/gm) || []).length;
          importStatements += importCount;

          // Compute code complexity metrics
          const ifBlocks = (fileContent.match(/if\s*\(/g) || []).length;
          const switchStatements = (fileContent.match(/case\s+/g) || []).length;
          const ternaryExpressions = (fileContent.match(/\?\s*:/g) || []).length;
          const logicalOperators = (fileContent.match(/(\&\&|\|\|)/g) || []).length;
          const complexityScore = 1 + ifBlocks + switchStatements + ternaryExpressions + Math.floor(logicalOperators / 2);

          complexityData.push({
            filename: filePath.split('/').pop(),
            score: complexityScore,
            conditionals: ifBlocks,
            switches: switchStatements,
            ternaries: ternaryExpressions
          });

          fileSizeData.push({
            filename: filePath.split('/').pop(),
            lineCount,
            functionCount: totalFuncs,
            importCount
          });
        }
      } catch (loadError) {
        console.error(`Issue loading ${filePath}:`, loadError);
      }
    }

    // Calculate average metrics
    const avgComplexityScore = complexityData.length > 0
      ? (complexityData.reduce((accumulator, item) => accumulator + item.score, 0) / complexityData.length).toFixed(2)
      : 0;

    const avgCodePerFile = fileCount > 0 ? (codeLineCount / fileCount).toFixed(2) : 0;

    // Identify large files needing attention
    const filesToRefactor = fileSizeData
      .filter(file => file.lineCount > 300 || file.functionCount > 10)
      .sort((fileA, fileB) => fileB.lineCount - fileA.lineCount)
      .slice(0, 5);

    return {
      summary: {
        totalFiles: fileCount,
        totalLines: codeLineCount,
        totalFunctions: functionDefinitions,
        totalComponents: reactComponentCount,
        totalImports: importStatements,
        avgComplexity: avgComplexityScore,
        avgLinesPerFile: avgCodePerFile
      },
      complexityMetrics: complexityData.sort((a, b) => b.score - a.score),
      fileMetrics: fileSizeData.sort((a, b) => b.lineCount - a.lineCount),
      problematicFiles: filesToRefactor,
      timestamp: new Date().toLocaleString()
    };
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="spinner"></div>
        <p>Performing codebase analysis...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard-container error">
        <h2>Analysis Failed</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 Static Analysis Dashboard</h1>
        <p className="timestamp">Last scanned: {analysisResult.timestamp}</p>
      </header>

      {/* Key Metrics Overview */}
      <section className="summary-cards">
        <div className="card summary-card">
          <div className="card-icon">📁</div>
          <div className="card-content">
            <div className="card-label">Total Files</div>
            <div className="card-value">{analysisResult.summary.totalFiles}</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon">📝</div>
          <div className="card-content">
            <div className="card-label">Lines of Code</div>
            <div className="card-value">{analysisResult.summary.totalLines.toLocaleString()}</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon">⚙️</div>
          <div className="card-content">
            <div className="card-label">Functions</div>
            <div className="card-value">{analysisResult.summary.totalFunctions}</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon">⚛️</div>
          <div className="card-content">
            <div className="card-label">React Components</div>
            <div className="card-value">{analysisResult.summary.totalComponents}</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-label">Total Imports</div>
            <div className="card-value">{analysisResult.summary.totalImports}</div>
          </div>
        </div>

        <div className="card summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Avg Complexity</div>
            <div className="card-value">{analysisResult.summary.avgComplexity}</div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* File Size Analysis */}
        <section className="card">
          <h2>📈 Files by Size (LOC)</h2>
          <div className="table-container">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Lines</th>
                  <th>Functions</th>
                  <th>Imports</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.fileMetrics.slice(0, 10).map((file, idx) => (
                  <tr key={idx} className={file.lineCount > 300 ? 'warning' : ''}>
                    <td className="filename">{file.filename}</td>
                    <td>
                      <span className="metric-badge">{file.lineCount}</span>
                    </td>
                    <td>
                      <span className="metric-badge">{file.functionCount}</span>
                    </td>
                    <td>
                      <span className="metric-badge">{file.importCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Complexity Breakdown */}
        <section className="card">
          <h2>🔍 Cyclomatic Complexity</h2>
          <div className="table-container">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Complexity</th>
                  <th>If/Else</th>
                  <th>Switch</th>
                  <th>Ternary</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.complexityMetrics.slice(0, 10).map((metric, idx) => (
                  <tr key={idx} className={metric.score > 10 ? 'high-complexity' : ''}>
                    <td className="filename">{metric.filename}</td>
                    <td>
                      <span className={`complexity-badge ${metric.score > 10 ? 'high' : 'normal'}`}>
                        {metric.score}
                      </span>
                    </td>
                    <td>{metric.conditionals}</td>
                    <td>{metric.switches}</td>
                    <td>{metric.ternaries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Files Needing Refactoring */}
        {analysisResult.problematicFiles.length > 0 && (
          <section className="card full-width">
            <h2>⚠️ Files Requiring Attention</h2>
            <p className="subtitle">Files exceeding recommended thresholds (300 LOC or 10+ functions)</p>
            <div className="problematic-files">
              {analysisResult.problematicFiles.map((file, idx) => (
                <div key={idx} className="problem-card">
                  <div className="problem-header">
                    <span className="filename">{file.filename}</span>
                    <span className="badge-warning">Refactor Needed</span>
                  </div>
                  <div className="problem-details">
                    <div className="detail">
                      <span className="label">Lines of Code:</span>
                      <span className="value">{file.lineCount}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Functions:</span>
                      <span className="value">{file.functionCount}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Imports:</span>
                      <span className="value">{file.importCount}</span>
                    </div>
                  </div>
                  <p className="recommendation">
                    💡 Consider breaking this file into smaller, focused modules to improve maintainability.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quality Insights */}
        <section className="card full-width">
          <h2>📋 Code Quality Insights</h2>
          <div className="insights-grid">
            <div className="insight">
              <div className="insight-icon">✅</div>
              <h3>Average File Size</h3>
              <p className="insight-value">{analysisResult.summary.avgLinesPerFile} LOC</p>
              <p className="insight-text">
                {analysisResult.summary.avgLinesPerFile < 200 ? '✓ Good' : '⚠ Consider refactoring'}
              </p>
            </div>
            <div className="insight">
              <div className="insight-icon">📊</div>
              <h3>Average Complexity</h3>
              <p className="insight-value">{analysisResult.summary.avgComplexity}</p>
              <p className="insight-text">
                {analysisResult.summary.avgComplexity < 5 ? '✓ Acceptable' : '⚠ Could be simpler'}
              </p>
            </div>
            <div className="insight">
              <div className="insight-icon">⚛️</div>
              <h3>Component Ratio</h3>
              <p className="insight-value">{((analysisResult.summary.totalComponents / analysisResult.summary.totalFiles) * 100).toFixed(0)}%</p>
              <p className="insight-text">React components per total files</p>
            </div>
            <div className="insight">
              <div className="insight-icon">🔗</div>
              <h3>Import Density</h3>
              <p className="insight-value">{(analysisResult.summary.totalImports / analysisResult.summary.totalFiles).toFixed(1)}</p>
              <p className="insight-text">Average imports per file</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StaticAnalysisDashboard;
