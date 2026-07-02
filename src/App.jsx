import { useState, useEffect } from "react";
import QuoteDisplay from "./QuoteDisplay";

function App() {
  const [quote, setQuote] = useState("Loading your first quote...");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [filterType, setFilterType] = useState("all");

  async function getRandomQuote(currentFilter) {
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts)
      try {
        const response = await fetch("https://dummyjson.com/quotes/random");
        const data = await response.json();
        const textLength = data.quote.length;

        // Determine if this specific quote fits the active filter criteria
        let matchesFilter = false;
        if (currentFilter === "all") matchesFilter = true;
        else if (currentFilter === "short" && textLength < 50)
          matchesFilter = true;
        else if (
          currentFilter === "medium" &&
          textLength >= 50 &&
          textLength <= 120
        )
          matchesFilter = true;
        else if (currentFilter === "long" && textLength > 120)
          matchesFilter = true;

        // If it matches, immediately break the loop and return the data payload
        if (matchesFilter) {
          return { quote: data.quote, author: data.author };
        }

        attempts++;
      } catch (error) {
        console.error("Error fetching quote:", error);
        return { quote: "Oops! Something went wrong.", author: "" };
      }
    // Fallback message if we can't find a quote matching the specific length after 15 tries
    return {
      quote: "Could not find a quote matching that length. Try again!",
      author: "",
    };
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setIsLoading(true);
      const result = await getRandomQuote("all");
      if (isMounted) {
        setQuote(result.quote);
        setAuthor(result.author);
        setIsLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleButtonClick() {
    setIsLoading(true);
    setIsCopied(false);
    const result = await getRandomQuote(filterType);
    setQuote(result.quote);
    setAuthor(result.author);
    setIsLoading(false);
  }

  // Dropdown Selection Handler
  async function handleFilterChange(event) {
    const selectedValue = event.target.value;
    setFilterType(selectedValue); // Update our React state tracking variable

    setIsLoading(true);
    setIsCopied(false);

    // Fetch a fresh quote that instantly matches the brand-new filter selection
    const result = await getRandomQuote(selectedValue);
    setQuote(result.quote);
    setAuthor(result.author);
    setIsLoading(false);
  }

  async function handleCopyClick() {
    if (!quote) return;

    try {
      await navigator.clipboard.writeText(`"${quote}" ~ ${author}`);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }

  return (
    <div className="card">
      <h1>Quote Generator</h1>

      <div className="select-container">
        <select
          value={filterType}
          onChange={handleFilterChange}
          disabled={isLoading}
        >
          <option value="all">Any Length</option>
          <option value="short">Short (&lt; 50 chars)</option>
          <option value="medium">Medium (50 - 120 chars)</option>
          <option value="long">Long (&gt; 120 chars)</option>
        </select>
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <QuoteDisplay
          text={quote}
          author={author}
          copiedStatus={isCopied}
          onCopy={handleCopyClick}
        />
      )}

      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Get New Quote"}
      </button>
    </div>
  );
}

export default App;
