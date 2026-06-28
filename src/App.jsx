import { useState, useEffect } from 'react';

function App() {
  const [quote, setQuote] = useState("Loading your first quote...");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(true)

  // 1. THE SINGLE CORE FETCH FUNCTION
  // It handles the network request and returns the data payload
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

  // 2. USEEFFECT FOR INITIAL PAGE LOAD
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
  }, []); // Safe from ESLint loop warnings because getRandomQuote doesn't call setState inside itself!

  // 3. EVENT HANDLER FOR THE BUTTON CLICK
  async function handleButtonClick() {
    setIsLoading(true)
    const result = await getRandomQuote();
    setQuote(result.quote);
    setAuthor(result.author);
    setIsLoading(false)
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