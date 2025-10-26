"use client";
import { motion } from "framer-motion";
import { Mic, Loader2 } from "lucide-react";
import React, { useState } from "react";

function VoiceAssistantButton() {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = () => {
    console.log("Voice Command button clicked. Toggling visual state.");
    
    if (!isListening && !isConnecting) {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsListening(true);
      }, 500)
    } else {
      setIsListening(false);
    }
  };

  const getButtonState = () => {
    if (isConnecting) {
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-white/70" />,
          label: "Connecting...",
          className: "bg-gray-600 hover:bg-gray-700 disabled:opacity-70",
        };
    }
    
    if (isListening) {
      return {
        icon: <Mic className="w-4 h-4 text-green-400 animate-pulse" />,
        label: "Listening...",
        className: "bg-green-600 hover:bg-green-700",
      };
    }
    
    return {
      icon: <Mic className="w-4 h-4 text-white/90" />,
      label: "Voice Command",
      className: "bg-purple-600 hover:bg-purple-700",
    };
  };

  const { icon, label, className } = getButtonState();

  return (
    <motion.button
      onClick={handleClick}
      disabled={isConnecting}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative inline-flex items-center gap-2.5 px-5 py-2.5
        rounded-xl transition-colors duration-200
        disabled:cursor-not-allowed
        focus:outline-none text-white ${className}
      `}
    >
      <div className="relative flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-4 h-4">
          {icon}
        </div>
        <span className="text-sm font-medium text-white/90 group-hover:text-white">
          {label}
        </span>
      </div>
    </motion.button>
  );
}
export default VoiceAssistantButton;