function AuthorQuiz({
  options,
  correctAuthor,
  selectedAnswer,
  onSelectAnswer,
}) {
  // Render multiple-choice options and highlight correct/wrong selections
  return (
    <div className="quiz-container">
      <p className="instructions">Guess the Author:</p>

      <div className="options-grid">
        {options.map((option, index) => {
          // Calculate dynamic classes and disabled state for option buttons
          let btnClass = "option-btn";
          const isAnswered = selectedAnswer !== null;

          if (isAnswered) {
            if (option === correctAuthor) {
              btnClass += " correct"; // correct answer highlighted
            } else if (option === selectedAnswer) {
              btnClass += " wrong"; // user's wrong choice highlighted
            }
          }

          return (
            <button
              key={index}
              className={btnClass}
              onClick={() => onSelectAnswer(option)}
              disabled={isAnswered} // freeze input once answered
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
