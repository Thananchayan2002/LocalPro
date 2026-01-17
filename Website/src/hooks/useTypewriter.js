import { useState, useEffect, useRef } from "react";

export const useTypewriter = (text, speed = 100, delay = 0) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayText("");
    setIsComplete(false);
    indexRef.current = 0;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start typing after delay
    const startTyping = () => {
      if (indexRef.current < text.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(text.slice(0, indexRef.current + 1));
          indexRef.current++;
          startTyping();
        }, speed);
      } else {
        setIsComplete(true);
      }
    };

    const initialTimeout = setTimeout(startTyping, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(initialTimeout);
    };
  }, [text, speed, delay]);

  return { displayText, isComplete };
};

// Word-by-word fade-in typewriter animation
export const useTypewriterWords = (text, wordDelay = 150, initialDelay = 0) => {
  const [words, setWords] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef(null);
  const indexRef = useRef(0);
  const wordsArray = text.split(" ");

  useEffect(() => {
    setWords([]);
    setIsComplete(false);
    indexRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const addWord = () => {
      if (indexRef.current < wordsArray.length) {
        timeoutRef.current = setTimeout(() => {
          setWords(wordsArray.slice(0, indexRef.current + 1));
          indexRef.current++;
          addWord();
        }, wordDelay);
      } else {
        setIsComplete(true);
      }
    };

    const initialTimeout = setTimeout(addWord, initialDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(initialTimeout);
    };
  }, [text, wordDelay, initialDelay]);

  return { words, isComplete };
};
