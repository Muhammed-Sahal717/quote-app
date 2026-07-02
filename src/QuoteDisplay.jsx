import { Check, Copy } from "lucide-react";

// This child component accepts a "props" object from the parent
function QuoteDisplay({ text, author, copiedStatus, onCopy }) {
  return (
    <div>
      {/* We read values out of the props object */}
      <p className="quote-text">"{text}"</p>
      {author && <span className="quote-author">~ {author}</span>}

      {/* We can even pass down functions like click handlers through props! */}
      <button className="copy-btn" onClick={onCopy}>
        {copiedStatus ? (
          <Check className="icon-green" size={20} />
        ) : (
          <Copy className="icon-gray" size={20} />
        )}
      </button>
    </div>
  );
}

export default QuoteDisplay;
