/**
 * Code Quality Analysis Module
 * Performs static analysis and metrics extraction on JavaScript/JSX source files
 */

export class CodeQualityAnalyzer {
  /**
   * Determine cyclomatic complexity by counting decision branches
   * Higher values indicate more complex control flow
   */
  static measureCyclomaticComplexity(sourceCode) {
    let baseComplexity = 1; // Start with base value

    // Add complexity for each decision point
    baseComplexity += (sourceCode.match(/\bif\b/g) || []).length;
    baseComplexity += (sourceCode.match(/\belse if\b/g) || []).length;
    baseComplexity += (sourceCode.match(/\bcatch\b/g) || []).length;
    baseComplexity += (sourceCode.match(/\bcase\b/g) || []).length;
    
    // Partial weight for tertiary operators
    const ternaryCount = (sourceCode.match(/(\?[^:]+:)/g) || []).length;
    baseComplexity += Math.floor(ternaryCount * 0.5);
    
    // Logical operators contribute partially
    const logicalOps = (sourceCode.match(/(\&\&|\|\|)/g) || []).length;
    baseComplexity += Math.floor(logicalOps * 0.3);

    return baseComplexity;
  }

  /**
   * Extract various quality and size metrics from source code
   */
  static measureCodeMetrics(sourceCode) {
    const totalLines = sourceCode.split('\n').length;
    const meaningfulLines = sourceCode.split('\n').filter(line => line.trim()).length;
    const commentBlocks = (sourceCode.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;
    const functionCount = this.countFunctionDefinitions(sourceCode);
    const classCount = (sourceCode.match(/\bclass\b/g) || []).length;
    const reactHookUsage = this.countHookInstances(sourceCode);

    return {
      lines: totalLines,
      nonEmptyLines: meaningfulLines,
      commentBlocks,
      commentPercentage: (commentBlocks / meaningfulLines * 100).toFixed(2),
      functions: functionCount,
      classes: classCount,
      hooks: reactHookUsage,
      complexity: this.measureCyclomaticComplexity(sourceCode)
    };
  }

  /**
   * Count all function definitions in source code
   */
  static countFunctionDefinitions(sourceCode) {
    const regularDeclarations = (sourceCode.match(/function\s+\w+/g) || []).length;
    const arrowFuncs = (sourceCode.match(/const\s+\w+\s*=\s*\(/g) || []).length;

    return regularDeclarations + arrowFuncs;
  }

  /**
   * Count React hook usage throughout component
   */
  static countHookInstances(sourceCode) {
    const reactHooks = [
      'useState', 'useEffect', 'useContext', 'useReducer',
      'useCallback', 'useMemo', 'useRef', 'useLayoutEffect',
      'useDebugValue', 'useTransition', 'useDeferredValue'
    ];

    let hookCount = 0;
    reactHooks.forEach(hookName => {
      const matches = sourceCode.match(new RegExp(`\\b${hookName}\\b`, 'g')) || [];
      hookCount += matches.length;
    });

    return hookCount;
  }

  /**
   * Detect anti-patterns and code quality issues
   */
  static findCodeIssues(sourceCode, filename) {
    const issues = [];

    // Detect excessively long functions
    const functionMatch = sourceCode.match(/(?:function|const)\s+\w+[^{]*\{[\s\S]*?\n(?=\s*(function|const|class|export))/g);
    if (functionMatch) {
      functionMatch.forEach((funcBody, position) => {
        const lineCount = funcBody.split('\n').length;
        if (lineCount > 50) {
          issues.push({
            category: 'FUNCTION_LENGTH',
            priority: 'medium',
            description: `Function exceeds 50 line limit (${lineCount} lines detected)`,
            location: position
          });
        }
      });
    }

    // Detect nested code blocks beyond acceptable depth
    const deepNesting = sourceCode.match(/(?:\{\s*){4,}/g);
    if (deepNesting) {
      issues.push({
        category: 'NESTING_DEPTH',
        priority: 'low',
        description: 'Code nesting exceeds 3 level threshold'
      });
    }

    // Locate development markers and task comments
    const markerComments = sourceCode.match(/\/\/(.*?(TODO|FIXME|BUG|HACK).*)?\n/gi);
    if (markerComments) {
      markerComments.forEach(comment => {
        issues.push({
          category: 'DEV_MARKER',
          priority: 'info',
          description: `Dev note found: ${comment.trim()}`
        });
      });
    }

    // Find debug console statements in code
    const debugStatements = sourceCode.match(/console\.(log|warn|error)\(/g);
    if (debugStatements) {
      issues.push({
        category: 'DEBUG_CODE',
        priority: 'low',
        description: `${debugStatements.length} console call(s) should be removed for production`
      });
    }

    // Identify potentially unused variables
    const varDeclares = sourceCode.match(/(?:const|let|var)\s+(\w+)/g);
    const unusedVarNames = [];
    if (varDeclares) {
      varDeclares.forEach(declaration => {
        const extractedName = declaration.match(/\w+$/)[0];
        const occurrenceCount = (sourceCode.match(new RegExp(`\\b${extractedName}\\b`, 'g')) || []).length;
        if (occurrenceCount <= 1) {
          unusedVarNames.push(extractedName);
        }
      });
    }

    if (unusedVarNames.length > 0) {
      issues.push({
        category: 'UNUSED_VAR',
        priority: 'low',
        description: `Unused variables detected: ${unusedVarNames.join(', ')}`
      });
    }

    return issues;
  }

  /**
   * Parse and categorize import statements
   */
  static analyzeImportStructure(sourceCode) {
    const importDeclarations = [];
    const importLines = sourceCode.match(/^import\s+.*?from\s+['"].*?['"];?$/gm) || [];

    importLines.forEach(importStatement => {
      const sourceMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/);
      if (sourceMatch) {
        importDeclarations.push(sourceMatch[1]);
      }
    });

    return {
      count: importDeclarations.length,
      externalPackages: importDeclarations.filter(path => !path.startsWith('.')).length,
      internalModules: importDeclarations.filter(path => path.startsWith('.')).length,
      allImports: importDeclarations
    };
  }

  /**
   * Calculate overall code health score (0-100 scale)
   */
  static computeHealthScore(metrics, issues) {
    let healthPoints = 100;

    // Complexity penalty
    if (metrics.complexity > 10) {
      const excessComplexity = (metrics.complexity - 10) * 2;
      healthPoints -= Math.min(20, excessComplexity);
    }

    // Issue-based penalties
    issues.forEach(issue => {
      if (issue.priority === 'high') healthPoints -= 10;
      else if (issue.priority === 'medium') healthPoints -= 5;
      else if (issue.priority === 'low') healthPoints -= 2;
    });

    // Documentation penalty
    if (metrics.commentPercentage < 5) {
      healthPoints -= 5;
    }

    return Math.max(0, Math.min(100, healthPoints));
  }
}
