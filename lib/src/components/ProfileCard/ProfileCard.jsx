import React, { useState } from "react";

export const ProfileCard = ({
  name = "John Doe",
  username = "@johndoe",
  bio = "Frontend developer and React enthusiast.",
  avatar = "https://via.placeholder.com/100",
  location = "India",
  buttonText = "Follow",
  backgroundColor = "#ffffff",
  color = "#111827",
  borderColor = "#e5e7eb",
  accentColor = "#2563eb",
  borderRadius = "16px",
  width = "320px",
  onFollow = () => {},
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    onFollow(!isFollowing);
  };

  const cardStyle = {
    width,
    padding: "24px",
    backgroundColor,
    color,
    border: `1px solid ${borderColor}`,
    borderRadius,
    boxSizing: "border-box",
    textAlign: "center",
    boxShadow: isHovered
      ? "0 12px 30px rgba(0, 0, 0, 0.12)"
      : "0 4px 12px rgba(0, 0, 0, 0.08)",
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
    transition: "all 0.2s ease",
  };

  const avatarStyle = {
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    objectFit: "cover",
    border: `3px solid ${accentColor}`,
    marginBottom: "14px",
  };

  const buttonStyle = {
    width: "100%",
    marginTop: "18px",
    padding: "11px 18px",
    backgroundColor: isFollowing ? "#e5e7eb" : accentColor,
    color: isFollowing ? "#111827" : "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={avatar} alt={name} style={avatarStyle} />

      <h2 style={{ margin: "0 0 4px", fontSize: "21px" }}>
        {name}
      </h2>

      <p
        style={{
          margin: "0 0 12px",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {username}
      </p>

      <p
        style={{
          margin: "0 0 10px",
          fontSize: "15px",
          lineHeight: 1.5,
          opacity: 0.8,
        }}
      >
        {bio}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "#6b7280",
        }}
      >
        📍 {location}
      </p>

      <button
        type="button"
        style={buttonStyle}
        onClick={handleFollow}
      >
        {isFollowing ? "Following" : buttonText}
      </button>
    </div>
  );
};

export default ProfileCard;