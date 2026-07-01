import { useState, useEffect } from 'react';
import {Copy, Check} from 'lucide-react';

function App() {
  const [quote, setQuote] = useState("Loading your first quote...");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)


  async function getRandomQuote() {
    try {
      const response = await fetch('https://dummyjson.com/quotes/random');
      const data = await response.json();
      return { quote: data.quote, author: data.author };
    } catch (error) {
      console.error('Error fetching quote:', error);
      return { quote: "Oops! Something went wrong.", author: "" };
    }
  }

  useEffect(() => {
    let isMounted = true; 

    async function loadInitialData() {
      setIsLoading(true)
      const result = await getRandomQuote();
      if (isMounted) {
        setQuote(result.quote);
        setAuthor(result.author);
        setIsLoading(false)
      }
    }

    loadInitialData();

    return () => {
      isMounted = false; 
    };
  }, []); 


  async function handleButtonClick() {
    setIsLoading(true)
    setIsCopied(false)
    const result = await getRandomQuote();
    setQuote(result.quote);
    setAuthor(result.author);
    setIsLoading(false)
  }

  async function handleCopyClick() {
    if (!quote) return;

    try {
      await navigator.clipboard.writeText(`"${quote}" ~ ${author}`);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }

  return (
    <div className="card">
      <h1>Quote Generator</h1>
      
      {/* 4. TERNARY LAYOUT CONDITIONAL SWITCH */}
      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div>
          <p className="quote-text">"{quote}"</p>
          {author && <span className="quote-author">~ {author}</span>}
          {/* 4. CONDITIONAL ICON DISPLAY TOGGLE */}
          <button className="copy-btn" onClick={handleCopyClick}>
            {isCopied ? (
              <Check className="icon-green" size={20} />
            ) : (
              <Copy className="icon-gray" size={20} />
            )}
          </button>
        </div>
      )}

      {/* 5. DYNAMIC BUTTON TEXT & DISABLED ATTRIBUTE */}
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Get New Quote"}
      </button>
    </div>
  );      
}

export default App;