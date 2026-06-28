import { useState, useEffect } from 'react';

function App() {
  const [quote, setQuote] = useState("Loading your first quote...");
  const [author, setAuthor] = useState(""); 

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
      const result = await getRandomQuote();
      if (isMounted) {
        setQuote(result.quote);
        setAuthor(result.author);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false; 
    };
  }, []); // Safe from ESLint loop warnings because getRandomQuote doesn't call setState inside itself!

  // 3. EVENT HANDLER FOR THE BUTTON CLICK
  async function handleButtonClick() {
    const result = await getRandomQuote();
    setQuote(result.quote);
    setAuthor(result.author);
  }

  return (
    <div className="card">
      <h1>Quote Generator</h1>
      <div>
        <p className="quote-text">"{quote}"</p>
        {author && (
          <span className="quote-author">
            ~ {author}
          </span>
        )}
      </div>
      <button onClick={handleButtonClick}>Get New Quote</button>
    </div>
  );      
}

export default App;