import React from 'react';
import { CheckIcon } from '../icons';

interface SubmissionSuccessProps {
  title: string;
  message: React.ReactNode;
  onReset: () => void;
  resetButtonText: string;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ title, message, onReset, resetButtonText }) => {
  return (
    <div role="alert" className="text-center p-8 bg-gray-800/50 border border-cyan-500/30 rounded-lg animate-scale-in-pop">
      <div className="mx-auto bg-green-500/20 rounded-full h-16 w-16 flex items-center justify-center border-2 border-green-500">
        <CheckIcon className="h-8 w-8 text-green-400" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-cyan-400">{title}</h2>
      <p className="mt-2 text-gray-300">{message}</p>
      <button onClick={onReset} className="mt-8 px-6 py-2 font-bold text-black bg-cyan-400 rounded-full transition-all hover:scale-105">
        {resetButtonText}
      </button>
    </div>
  );
};