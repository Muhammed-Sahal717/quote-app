import { useState, useEffect, useCallback } from "react";
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

        // Determine quote length and whether it matches the selected filter
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
    // Collect other authors from the pool excluding the correct one
    const otherAuthors = fullPool
      .map((q) => q.author)
      .filter((auth) => auth !== correctAuthor);

    // Pick up to three unique wrong authors at random
    const wrongChoices = []; // accumulator for wrong author choices
    while (wrongChoices.length < 3 && otherAuthors.length > 0) {
      // stop when we have 3 or pool is empty
      const randomIndex = Math.floor(Math.random() * otherAuthors.length); // select random index
      const randomAuthor = otherAuthors.splice(randomIndex, 1)[0]; // remove and retrieve author at index
      if (!wrongChoices.includes(randomAuthor)) {
        // ensure uniqueness
        wrongChoices.push(randomAuthor); // add chosen author to wrongChoices
      }
    }

    // Combine correct answer with wrong choices and shuffle
    const combined = [correctAuthor, ...wrongChoices];
    return combined.sort(() => Math.random() - 0.5);
  }

  // Wrap this function in useCallback so it maintains a stable reference in memory
  const setupNewRound = useCallback(
    (selectedQuote, selectedAuthor, poolData) => {
      setQuote(selectedQuote);
      setAuthor(selectedAuthor);
      setSelectedAnswer(null);

      const generatedChoices = generateOptions(selectedAuthor, poolData);
      setOptions(generatedChoices);
    },
    [],
  ); // Empty brackets mean this function reference never changes

  useEffect(() => {
    // Use a mounted flag to avoid updating state after unmount
    let isMounted = true;

    async function loadInitialData() {
      setIsLoading(true);
      // 1. Download the master pool data first
      const sharedPool = await fetchQuotesPool();

      // 2. Extract a random starter item matching our parameters
      const result = await getRandomQuote("all", sharedPool);

      // Only update state if the component is still mounted
      if (isMounted && sharedPool.length > 0) {
        setupNewRound(result.quote, result.author, sharedPool);
        setIsLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [setupNewRound]);

  async function handleButtonClick() {
    // Fetch a new quote for the current filter and update the UI
    setIsLoading(true);
    setIsCopied(false);
    const result = await getRandomQuote(filterType, allQuotes);
    setupNewRound(result.quote, result.author, allQuotes);
    setIsLoading(false);
  }

  async function handleFilterChange(event) {
    // Update filter type and immediately load a quote matching it
    const selectedValue = event.target.value;
    setFilterType(selectedValue);
    setIsLoading(true);
    setIsCopied(false);

    const result = await getRandomQuote(selectedValue, allQuotes);
    setupNewRound(result.quote, result.author, allQuotes);
    setIsLoading(false);
  }

  async function handleCopyClick() {
    // Copy the current quote and author to the clipboard
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
    // Record which author the user selected
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
            author={author}
            copiedStatus={isCopied}
            onCopy={handleCopyClick}
            gameFinished={selectedAnswer != null}
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
