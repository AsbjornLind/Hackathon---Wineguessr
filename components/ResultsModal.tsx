
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult } from '../types';

interface ResultsModalProps {
  result: GameResult;
  onNext: () => void;
}

const AnimatedCounter: React.FC<{ value: number; unit: string; }> = ({ value, unit }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 1500;
        const startTime = Date.now();

        const timer = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentVal = Math.floor(progress * end);
            setDisplayValue(currentVal);
            if (progress < 1) {
                requestAnimationFrame(timer);
            }
        };
        requestAnimationFrame(timer);
    }, [value]);

    return (
        <span className="font-bold text-4xl text-rose-900">{displayValue.toLocaleString()}<span className="text-2xl text-stone-500 ml-1">{unit}</span></span>
    );
};

export const ResultsModal: React.FC<ResultsModalProps> = ({ result, onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center"
      >
        <h2 className="font-serif text-3xl font-bold text-stone-800">Round Complete!</h2>
        <p className="text-stone-500 mt-2">The wine was <span className="font-bold text-rose-800">{result.wine.name}</span> from <span className="font-bold text-rose-800">{result.wine.country}</span>.</p>

        <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-lg">
                <p className="text-sm text-stone-500">DISTANCE</p>
                <AnimatedCounter value={result.distance} unit="km" />
            </div>
             <div className="bg-stone-50 p-4 rounded-lg">
                <p className="text-sm text-stone-500">SCORE</p>
                <AnimatedCounter value={result.score} unit="pts" />
            </div>
        </div>

        <motion.button
            onClick={onNext}
            className="w-full mt-8 bg-rose-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-900 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
          Next Wine
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
