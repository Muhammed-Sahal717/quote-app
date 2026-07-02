import { Check, Copy } from "lucide-react";

// This child component accepts a "props" object from the parent
function QuoteDisplay(props) {
  return (
    <div>
      {/* We read values out of the props object */}
      <p className="quote-text">"{props.text}"</p>
      {props.author && <span className="quote-author">~ {props.author}</span>}

      {/* We can even pass down functions like click handlers through props! */}
      <button className="copy-btn" onClick={props.onCopy}>
        {props.copiedStatus ? (
          <Check className="icon-green" size={20} />
        ) : (
          <Copy className="icon-gray" size={20} />
        )}
      </button>
    </div>
  );
}

export default QuoteDisplay;
