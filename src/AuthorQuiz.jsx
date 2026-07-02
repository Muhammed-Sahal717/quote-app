function AuthorQuiz({
  options,
  correctAuthor,
  selectedAnswer,
  onSelectAnswer,
}) {
  return (
    <div className="quiz-container">
      <p className="instructions">Guess the Author:</p>

      <div className="options-grid">
        {options.map((option, index) => {
          // 1. Calculate the dynamic visual state classes for this button
          let btnClass = "option-btn";
          const isAnswered = selectedAnswer !== null;

          if (isAnswered) {
            if (option === correctAuthor) {
              btnClass += " correct"; // Highlight true answer green
            } else if (option === selectedAnswer) {
              btnClass += " wrong"; // Highlight clicked false answer red
            }
          }

          return (
            <button
              key={index}
              className={btnClass}
              onClick={() => onSelectAnswer(option)}
              disabled={isAnswered} // Freeze input once answered
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AuthorQuiz;
