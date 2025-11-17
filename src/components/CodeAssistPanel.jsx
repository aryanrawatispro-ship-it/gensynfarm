import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import './CodeAssistPanel.css';

const CODING_PROBLEMS = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Find two numbers that add up to target',
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n  \n}',
    solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}',
    testCases: ['[2,7,11,15], 9 → [0,1]', '[3,2,4], 6 → [1,2]'],
    reward: 6.0,
    xp: 40,
    time: 120,
  },
  {
    id: 2,
    title: 'Reverse String',
    difficulty: 'Easy',
    description: 'Reverse a string in-place',
    starterCode: 'function reverse(s) {\n  // Your code here\n  \n}',
    solution: 'function reverse(s) {\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n}',
    testCases: ['["h","e","l","l","o"] → ["o","l","l","e","h"]'],
    reward: 5.5,
    xp: 35,
    time: 90,
  },
  {
    id: 3,
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    description: 'Check if brackets are balanced',
    starterCode: 'function isValid(s) {\n  // Your code here\n  \n}',
    solution: 'function isValid(s) {\n  const stack = [];\n  const map = {")": "(", "}": "{", "]": "["};\n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}',
    testCases: ['"()" → true', '"()[]{}" → true', '"(]" → false'],
    reward: 7.5,
    xp: 50,
    time: 150,
  },
  {
    id: 4,
    title: 'Merge Intervals',
    difficulty: 'Hard',
    description: 'Merge overlapping intervals',
    starterCode: 'function merge(intervals) {\n  // Your code here\n  \n}',
    solution: 'function merge(intervals) {\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = result[result.length - 1];\n    if (intervals[i][0] <= last[1]) {\n      last[1] = Math.max(last[1], intervals[i][1]);\n    } else {\n      result.push(intervals[i]);\n    }\n  }\n  return result;\n}',
    testCases: ['[[1,3],[2,6],[8,10]] → [[1,6],[8,10]]'],
    reward: 9.5,
    xp: 65,
    time: 210,
  },
];

export default function CodeAssistPanel() {
  const { state, dispatch } = useGame();
  const codeAssistState = state.productStates.codeassist;
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [timer, setTimer] = useState(0);

  const isUnlocked = state.ownedProducts.includes('codeassist');

  // Timer for problem solving
  useEffect(() => {
    if (!selectedProblem || state.isPaused) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + (1 * state.gameSpeed));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedProblem, state.isPaused, state.gameSpeed]);

  // CodeAssist suggestions (simulated)
  useEffect(() => {
    if (!selectedProblem || userCode.length < 10) return;

    const suggestionTimer = setTimeout(() => {
      generateSuggestion();
    }, 2000);

    return () => clearTimeout(suggestionTimer);
  }, [userCode, selectedProblem]);

  const startProblem = (problem) => {
    const availableGPU = state.ownedGPUs.find(gpu => {
      const isNotBusy = !state.activeJobs.find(j => j.gpuId === gpu.id);
      return gpu.status === 'idle' && isNotBusy;
    });

    if (!availableGPU) {
      alert('No available GPU. CodeAssist requires GPU for inference.');
      return;
    }

    setSelectedProblem(problem);
    setUserCode(problem.starterCode);
    setTimer(0);
    setTestResults([]);
    setSuggestions([]);

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codeassist',
      updates: {
        status: 'running',
        activeJob: problem.id,
      },
    });
  };

  const generateSuggestion = () => {
    const suggestionList = [
      'Consider using a Map for O(1) lookups',
      'This could be optimized with two pointers',
      'Don\'t forget edge cases (empty input, single element)',
      'A stack data structure might help here',
      'Try sorting the array first',
    ];

    const suggestion = suggestionList[Math.floor(Math.random() * suggestionList.length)];
    setSuggestions(prev => [...prev, suggestion]);
    setShowSuggestion(true);

    setTimeout(() => setShowSuggestion(false), 5000);

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codeassist',
      updates: {
        suggestionsGiven: codeAssistState.suggestionsGiven + 1,
      },
    });
  };

  const acceptSuggestion = () => {
    const currentAcceptance = codeAssistState.acceptanceRate;
    const newRate = (currentAcceptance * codeAssistState.suggestionsGiven + 1) / (codeAssistState.suggestionsGiven + 1);

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codeassist',
      updates: {
        acceptanceRate: newRate * 100,
      },
    });

    setShowSuggestion(false);
  };

  const runCode = () => {
    setIsRunning(true);

    // Check for syntax errors (basic simulation)
    if (Math.random() < 0.15) {
      dispatch({
        type: 'SET_PRODUCT_ERROR',
        productId: 'codeassist',
        errorType: 'syntax_error',
        errorDetails: { line: Math.floor(Math.random() * 10) + 1, details: 'Unexpected token' },
      });

      setTestResults([{ status: 'error', message: 'Syntax Error: Check your code' }]);
      setIsRunning(false);
      return;
    }

    // Simulate code execution
    setTimeout(() => {
      const similarity = calculateSimilarity(userCode, selectedProblem.solution);
      const passed = similarity > 0.6 || userCode.includes('return');

      if (passed) {
        completeProblem();
      } else {
        setTestResults([
          { status: 'fail', message: 'Test case 1: Failed' },
          { status: 'pass', message: 'Test case 2: Passed' },
        ]);
      }

      setIsRunning(false);
    }, 1500);
  };

  const calculateSimilarity = (code1, code2) => {
    const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();
    const n1 = normalize(code1);
    const n2 = normalize(code2);

    let matches = 0;
    const length = Math.min(n1.length, n2.length);

    for (let i = 0; i < length; i++) {
      if (n1[i] === n2[i]) matches++;
    }

    return matches / Math.max(n1.length, n2.length);
  };

  const completeProblem = () => {
    const reward = selectedProblem.reward;
    const newSpecScore = codeAssistState.specializationScore + Math.floor(Math.random() * 5) + 1;

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codeassist',
      updates: {
        status: 'idle',
        activeJob: null,
        problemsSolved: codeAssistState.problemsSolved + 1,
        specializationScore: newSpecScore,
      },
    });

    dispatch({ type: 'ADD_EXPERIENCE', amount: selectedProblem.xp });

    setTestResults([
      { status: 'pass', message: 'All test cases passed!' },
    ]);

    alert(`Problem solved! Earned $${reward.toFixed(2)} and ${selectedProblem.xp} XP`);

    setTimeout(() => {
      setSelectedProblem(null);
      setUserCode('');
      setTimer(0);
      setTestResults([]);
    }, 2000);
  };

  if (!isUnlocked) {
    return (
      <div className="codeassist-panel locked">
        <div className="locked-message">
          <div className="lock-icon">🔒</div>
          <h3>CodeAssist</h3>
          <p>Unlock at Level 15 for $5,000</p>
          <p>AI coding assistant with real-time suggestions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="codeassist-panel">
      <div className="panel-header">
        <h3>💻 CodeAssist</h3>
        <div className="coding-status">
          <span className={`status-dot ${selectedProblem ? 'active' : 'idle'}`} />
          {selectedProblem ? 'Solving' : 'Idle'}
        </div>
      </div>

      {selectedProblem ? (
        <div className="code-editor">
          <div className="problem-header">
            <div className="problem-title">
              {selectedProblem.title}
              <span className={`diff-badge ${selectedProblem.difficulty.toLowerCase()}`}>
                {selectedProblem.difficulty}
              </span>
            </div>
            <div className="timer">⏱ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</div>
          </div>

          <div className="problem-description">
            {selectedProblem.description}
          </div>

          <div className="test-cases">
            <strong>Test Cases:</strong>
            {selectedProblem.testCases.map((tc, i) => (
              <div key={i} className="test-case">{tc}</div>
            ))}
          </div>

          <div className="editor-container">
            <textarea
              className="code-textarea"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck={false}
              placeholder="Write your solution..."
            />

            {showSuggestion && suggestions.length > 0 && (
              <div className="suggestion-popup">
                <div className="suggestion-header">
                  <span>💡 CodeAssist Suggestion</span>
                  <button onClick={acceptSuggestion}>Accept</button>
                </div>
                <div className="suggestion-text">
                  {suggestions[suggestions.length - 1]}
                </div>
              </div>
            )}
          </div>

          <div className="editor-actions">
            <button
              className="run-btn"
              onClick={runCode}
              disabled={isRunning || userCode.length < 20}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setSelectedProblem(null);
                setUserCode('');
                dispatch({
                  type: 'UPDATE_PRODUCT_STATE',
                  productId: 'codeassist',
                  updates: { status: 'idle', activeJob: null },
                });
              }}
            >
              Cancel
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="test-results">
              {testResults.map((result, i) => (
                <div key={i} className={`result ${result.status}`}>
                  {result.status === 'pass' ? '✓' : '✗'} {result.message}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="problems-section">
          <h4>Coding Problems</h4>
          <div className="problems-list">
            {CODING_PROBLEMS.map(problem => (
              <div key={problem.id} className="problem-card">
                <div className="problem-card-header">
                  <span className="problem-card-title">{problem.title}</span>
                  <span className={`diff-badge ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="problem-card-desc">{problem.description}</div>
                <div className="problem-card-stats">
                  <span>⏱ {problem.time}s</span>
                  <span className="reward">${problem.reward}</span>
                  <span className="xp">+{problem.xp} XP</span>
                </div>
                <button
                  className="solve-btn"
                  onClick={() => startProblem(problem)}
                >
                  Solve Problem
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="assistant-stats">
        <div className="stat-row">
          <span>Problems Solved:</span>
          <span>{codeAssistState.problemsSolved}</span>
        </div>
        <div className="stat-row">
          <span>Suggestions Given:</span>
          <span>{codeAssistState.suggestionsGiven}</span>
        </div>
        <div className="stat-row">
          <span>Acceptance Rate:</span>
          <span>{codeAssistState.acceptanceRate.toFixed(0)}%</span>
        </div>
        <div className="stat-row">
          <span>Specialization Score:</span>
          <span>{codeAssistState.specializationScore}</span>
        </div>
      </div>
    </div>
  );
}
