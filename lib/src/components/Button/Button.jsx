import React, { useState } from "react";

export const Button = ({
  text = "Click Me",
  size = "medium",
  backgroundColor = "#111827",
  color = "#ffffff",
  hoverColor = "#374151",
  borderRadius = "8px",
  disabled = false,
  onClick = () => {},
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizes = {
    small: { padding: "8px 14px", fontSize: "14px" },
    medium: { padding: "10px 18px", fontSize: "16px" },
    large: { padding: "14px 24px", fontSize: "18px" },
  };

  const style = {
    ...sizes[size],
    backgroundColor: disabled
      ? "#9ca3af"
      : isHovered
      ? hoverColor
      : backgroundColor,
    color,
    border: "none",
    borderRadius,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.7 : 1,
  };

  return (
    <button
      type="button"
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text}
    </button>
  );
};

export default Button; 