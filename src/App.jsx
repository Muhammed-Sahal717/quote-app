import { useState, useEffect } from "react";
import QuoteDisplay from "./QuoteDisplay";
import AuthorQuiz from "./AuthorQuiz"; // Import our new quiz template component

function App() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // --- GAME STATE VARIABLES ---
  const [allQuotes, setAllQuotes] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  async function getRandomQuote(currentFilter, activePool) {
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      try {
        // If we have local pool data, pull from it to save network requests
        let data;
        if (activePool && activePool.length > 0) {
          const randomIndex = Math.floor(Math.random() * activePool.length);
          data = activePool[randomIndex];
        } else {
          const response = await fetch("https://dummyjson.com/quotes/random");
          data = await response.json();
        }

        const textLength = data.quote.length;
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

        if (matchesFilter) {
          return { quote: data.quote, author: data.author };
        }
        attempts++;
      } catch (error) {
        console.error("Error fetching quote:", error);
        return { quote: "Oops! Something went wrong.", author: "" };
      }
    }
    return {
      quote: "Could not find a quote matching that length. Try again!",
      author: "",
    };
  }

  async function fetchQuotesPool() {
    try {
      const response = await fetch("https://dummyjson.com/quotes?limit=100");
      const data = await response.json();
      setAllQuotes(data.quotes);
      return data.quotes;
    } catch (error) {
      console.error("Pool fetch failed:", error);
      return [];
    }
  }

  function generateOptions(correctAuthor, fullPool) {
    const otherAuthors = fullPool
      .map((q) => q.author)
      .filter((auth) => auth !== correctAuthor);

    const wrongChoices = [];
    while (wrongChoices.length < 3 && otherAuthors.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherAuthors.length);
      const randomAuthor = otherAuthors.splice(randomIndex, 1)[0];
      if (!wrongChoices.includes(randomAuthor)) {
        wrongChoices.push(randomAuthor);
      }
    }

    const combined = [correctAuthor, ...wrongChoices];
    return combined.sort(() => Math.random() - 0.5);
  }

  // Orchestrator function to prepare a clean round of the game
  function setupNewRound(selectedQuote, selectedAuthor, poolData) {
    setQuote(selectedQuote);
    setAuthor(selectedAuthor);
    setSelectedAnswer(null); // Clear previous selection

    const generatedChoices = generateOptions(selectedAuthor, poolData);
    setOptions(generatedChoices);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      setIsLoading(true);
      // 1. Download the master pool data first
      const sharedPool = await fetchQuotesPool();

      // 2. Extract a random starter item matching our parameters
      const result = await getRandomQuote("all", sharedPool);

      if (isMounted && sharedPool.length > 0) {
        setupNewRound(result.quote, result.author, sharedPool);
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
    const result = await getRandomQuote(filterType, allQuotes);
    setupNewRound(result.quote, result.author, allQuotes);
    setIsLoading(false);
  }

  async function handleFilterChange(event) {
    const selectedValue = event.target.value;
    setFilterType(selectedValue);
    setIsLoading(true);
    setIsCopied(false);

    const result = await getRandomQuote(selectedValue, allQuotes);
    setupNewRound(result.quote, result.author, allQuotes);
    setIsLoading(false);
  }

  async function handleCopyClick() {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(`"${quote}" ~ ${author}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }

  // Handler passed down to child component to intercept choice selections
  function handleSelectAnswer(chosenAuthor) {
    setSelectedAnswer(chosenAuthor);
  }

  return (
    <div className="card">
      <h1>Quote Quiz Game</h1>

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
        <div>
          {/* Note: We pass an empty string to author here to hide the answer inside QuoteDisplay */}
          <QuoteDisplay
            text={quote}
            author=""
            copiedStatus={isCopied}
            onCopy={handleCopyClick}
          />

          {/* Render our interactive multiple choice engine */}
          <AuthorQuiz
            options={options}
            correctAuthor={author}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleSelectAnswer}
          />
        </div>
      )}

      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Next Round"}
      </button>
    </div>
  );
}

export default App;
