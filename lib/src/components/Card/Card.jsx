import React, { useState } from "react";

export const Card = ({
  title = "Card Title",
  description = "This is a simple reusable card component.",
  image = "",
  buttonText = "Learn More",
  backgroundColor = "#ffffff",
  color = "#111827",
  borderColor = "#e5e7eb",
  borderRadius = "12px",
  padding = "20px",
  width = "320px",
  onClick = () => {},
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    width,
    padding,
    backgroundColor,
    color,
    border: `1px solid ${borderColor}`,
    borderRadius,
    boxSizing: "border-box",
    overflow: "hidden",
    boxShadow: isHovered
      ? "0 10px 25px rgba(0, 0, 0, 0.12)"
      : "0 4px 12px rgba(0, 0, 0, 0.08)",
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
    transition: "all 0.2s ease",
  };

  const imageStyle = {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "16px",
  };

  const buttonStyle = {
    marginTop: "16px",
    padding: "10px 16px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {image && <img src={image} alt={title} style={imageStyle} />}

      <h2 style={{ margin: "0 0 8px", fontSize: "20px" }}>
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: "15px",
          lineHeight: 1.6,
          opacity: 0.75,
        }}
      >
        {description}
      </p>

      <button type="button" style={buttonStyle} onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default Card;