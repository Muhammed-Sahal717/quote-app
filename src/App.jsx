import { useState, useEffect, useCallback } from "react";
import QuoteDisplay from "./QuoteDisplay";
import AuthorQuiz from "./AuthorQuiz";

// Helper (pure): generate a shuffled list of authors including the correct one.
// Kept outside the component to avoid recreating the function on every render.
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

function App() {
  // UI-related state
  const [quote, setQuote] = useState(""); // current quote text
  const [author, setAuthor] = useState(""); // current correct author
  const [isLoading, setIsLoading] = useState(true); // whether data is being loaded
  const [isCopied, setIsCopied] = useState(false); // clipboard feedback flag
  const [filterType, setFilterType] = useState("all"); // active length filter

  // Game data/state
  const [allQuotes, setAllQuotes] = useState([]); // cached pool used to generate options
  const [options, setOptions] = useState([]); // current multiple-choice options
  const [selectedAnswer, setSelectedAnswer] = useState(null); // user's selected option

  // Find a random quote matching `currentFilter` (tries the cached pool first)
  async function getRandomQuote(currentFilter, activePool) {
    let attempts = 0;
    const maxAttempts = 15; // avoid infinite loops when filters are strict

    while (attempts < maxAttempts) {
      try {
        // Prefer sampling from the provided `activePool` to reduce network calls
        let data;
        if (activePool && activePool.length > 0) {
          const randomIndex = Math.floor(Math.random() * activePool.length);
          data = activePool[randomIndex];
        } else {
          // Fallback: request a single random quote from the API
          const response = await fetch("https://dummyjson.com/quotes/random");
          data = await response.json();
        }

        // Determine whether this quote matches the requested length filter
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
          // Return the first matching quote we find
          return { quote: data.quote, author: data.author };
        }

        // Try again if it didn't match
        attempts++;
      } catch (error) {
        // On network/parsing error, return a friendly fallback quote
        console.error("Error fetching quote:", error);
        return { quote: "Oops! Something went wrong.", author: "" };
      }
    }

    // If no matching quote was found after retries, inform the user
    return {
      quote: "Could not find a quote matching that length. Try again!",
      author: "",
    };
  }

  // Load a bulk pool of quotes used locally for option generation
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

  // Initialize a new quiz round with a quote, author and generated options
  const setupNewRound = useCallback(
    (selectedQuote, selectedAuthor, poolData) => {
      setQuote(selectedQuote);
      setAuthor(selectedAuthor);
      setSelectedAnswer(null); // reset previous selection

      // Generate multiple-choice options from the provided pool
      const generatedChoices = generateOptions(selectedAuthor, poolData);
      setOptions(generatedChoices);
    },
    [],
  );

  // On mount: fetch the quote pool and seed the first round
  useEffect(() => {
    let isMounted = true; // guard to avoid state updates after unmount

    async function loadInitialData() {
      setIsLoading(true);
      const sharedPool = await fetchQuotesPool();
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
  }, [setupNewRound]);

  async function handleButtonClick() {
    // Trigger fetching a new random quote for the current filter
    setIsLoading(true);
    setIsCopied(false);
    const result = await getRandomQuote(filterType, allQuotes);
    setupNewRound(result.quote, result.author, allQuotes);
    setIsLoading(false);
  }

  async function handleFilterChange(event) {
    // Apply a new length filter and immediately fetch a matching quote
    const selectedValue = event.target.value;
    setFilterType(selectedValue);
    setIsLoading(true);
    setIsCopied(false);

    const result = await getRandomQuote(selectedValue, allQuotes);
    setupNewRound(result.quote, result.author, allQuotes);
    setIsLoading(false);
  }

  async function handleCopyClick() {
    // Copy the currently displayed quote and author to clipboard
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(`"${quote}" ~ ${author}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // reset feedback after delay
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }

  function handleSelectAnswer(chosenAuthor) {
    // Save the user's choice so UI can show correct/wrong feedback
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
          <QuoteDisplay
            text={quote}
            author={author}
            copiedStatus={isCopied}
            onCopy={handleCopyClick}
            gameFinished={selectedAnswer !== null}
          />

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
