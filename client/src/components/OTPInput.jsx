import React, { useRef, useEffect } from 'react';

const OTPInput = ({ value, onChange, length = 6, disabled = false, onComplete }) => {
  const inputRefs = useRef([]);
  const digits = (value || '').padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => d === ' ');
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    if (inputRefs.current[targetIndex] && !disabled) {
      inputRefs.current[targetIndex].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const char = e.target.value.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char || ' ';
    const updatedValue = newDigits.join('').trimEnd();

    onChange(updatedValue);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === length - 1 && updatedValue.length === length) {
      onComplete?.(updatedValue);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (digits[index] === ' ' && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = ' ';
        onChange(newDigits.join('').trimEnd());
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = ' ';
        onChange(newDigits.join('').trimEnd());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const numericData = pasteData.replace(/\D/g, '').slice(0, length);

    if (numericData) {
      onChange(numericData);
      const nextIndex = Math.min(numericData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      if (numericData.length === length) {
        onComplete?.(numericData);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => {
        const digit = digits[index] !== ' ' ? digits[index] : '';
        const isFilled = digit !== '';

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl transition-all outline-none border ${
              isFilled
                ? 'bg-[#EAF4EE] border-[#194D33] text-[#194D33] shadow-sm'
                : 'bg-white border-[#E5EAE6] text-slate-900 hover:border-slate-300'
            } focus:border-[#194D33] focus:bg-white focus:ring-2 focus:ring-[#194D33]/20 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
};

export default OTPInput;
