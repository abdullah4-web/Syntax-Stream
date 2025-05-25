import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const textareaRef = useRef(null);
  const codeOutputRef = useRef(null);
  const editorBodyRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const codeContainerRef = useRef(null);

  const sampleCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`;

  useEffect(() => {
    if (!hasStartedTyping && inputText === '') {
      setInputText(sampleCode);
    }
  }, [hasStartedTyping, inputText]);

  // Handle typing effect
  useEffect(() => {
    if (!hasStartedTyping) return;

    if (currentIndex < inputText.length) {
      const timer = setTimeout(() => {
        setTypedText(prev => inputText.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
        
        // Auto-scroll to cursor position
        if (codeOutputRef.current) {
          const codeElement = codeOutputRef.current;
          const cursorPos = codeElement.getBoundingClientRect();
          codeElement.parentElement.scrollTo({
            left: cursorPos.right - window.innerWidth + 100,
            behavior: 'smooth'
          });
        }
      }, Math.random() * 30 + 20);
      
      return () => clearTimeout(timer);
    } else {
      setIsTypingComplete(true);
    }
  }, [currentIndex, inputText, hasStartedTyping]);

  // Highlight syntax whenever typedText changes
  useEffect(() => {
    if (codeOutputRef.current) {
      Prism.highlightElement(codeOutputRef.current);
    }
  }, [typedText]);

  // Sync scroll positions between code and line numbers
  useEffect(() => {
    const editorBody = editorBodyRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (editorBody && lineNumbers) {
      const handleScroll = () => {
        lineNumbers.scrollTop = editorBody.scrollTop;
      };
      editorBody.addEventListener('scroll', handleScroll);
      return () => editorBody.removeEventListener('scroll', handleScroll);
    }
  }, [hasStartedTyping]);

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (evt) => {
    let value = inputText,
      selStartPos = evt.currentTarget.selectionStart;

    if (evt.key === 'Tab') {
      evt.preventDefault();
      const newValue =
        value.substring(0, selStartPos) +
        '    ' +
        value.substring(selStartPos, value.length);
      setInputText(newValue);
      
      setTimeout(() => {
        evt.currentTarget.selectionStart = selStartPos + 4;
        evt.currentTarget.selectionEnd = selStartPos + 4;
      }, 0);
    }
  };

  const startTyping = () => {
    if (inputText.trim() && !hasStartedTyping) {
      setHasStartedTyping(true);
      setTypedText('');
      setCurrentIndex(0);
      setIsTypingComplete(false);
    }
  };

  const resetAnimation = () => {
    setHasStartedTyping(false);
    setIsTypingComplete(false);
    setTypedText('');
    setCurrentIndex(0);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const useSampleCode = () => {
    setInputText(sampleCode);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const lineNumbers = () => {
    const lines = typedText.split('\n');
    return lines.map((_, i) => (
      <div key={i} className="line-number">{i + 1}</div>
    ));
  };

  return (
    <div className="App">
      <div className="mobile-frame">
        <div className="editor-container">
          {!hasStartedTyping ? (
            <div className="input-area">
              <textarea
                ref={textareaRef}
                placeholder="Or type your own code here..."
                value={inputText}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rows={8}
                spellCheck="false"
                autoFocus
              />
              <div className="button-group">
                <button onClick={useSampleCode} className="action-button">
                  Use Sample Code
                </button>
                <button 
                  onClick={startTyping} 
                  className="action-button primary"
                  disabled={!inputText.trim()}
                >
                  Start Typing Effect
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="editor-header">
                <div className="file-name">script.js</div>
              </div>
              
              <div className="editor-body" ref={editorBodyRef}>
                <div className="code-edit-container" ref={codeContainerRef}>
                  <div className="line-numbers" ref={lineNumbersRef}>
                    {lineNumbers()}
                    {!isTypingComplete && typedText.length > 0 && (
                      <div className="line-number">{typedText.split('\n').length + 1}</div>
                    )}
                  </div>
                  <pre className="code-output">
                    <code 
                      ref={codeOutputRef} 
                      className="language-javascript"
                    >
                      {typedText}
                    </code>
                    {!isTypingComplete && (
                      <span className="cursor"></span>
                    )}
                  </pre>
                </div>
                
                {isTypingComplete && (
                  <>
                    <div className="status-bar">
                      <span>JavaScript</span>
                      <span>Ln {typedText.split('\n').length}, Col {typedText.split('\n').pop().length}</span>
                    </div>
                    <button className="reset-button" onClick={resetAnimation}>
                      ↻ Restart Animation
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;