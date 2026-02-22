export default {
  control: {},

  "&multiLine": {
    control: {
      fontFamily: "var(--font-body)",
    },
    highlighter: {
      padding: "0.65rem 1rem",
      margin: 0,
      border: "1px solid transparent",
      color: "transparent",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      minHeight: "88px",
      lineHeight: "1.5rem",
      fontSize: "0.9rem",
    },
    input: {
      padding: "0.65rem 1rem",
      margin: 0,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      outline: "none",
      fontFamily: "DM Sans, sans-serif",
      fontSize: "0.9rem",
      lineHeight: "1.5rem",
      backgroundColor: "rgba(255, 255, 255, 0.04)",
      color: "#ffffff",
      caretColor: "#b9f43d",
      width: "100%",
      minHeight: "88px",
      resize: "none",
      transition: "border-color 200ms, box-shadow 200ms",
    },
  },

  suggestions: {
    list: {
      backgroundColor: "#1c1c21",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      fontSize: "0.875rem",
      borderRadius: "12px",
      maxHeight: "200px",
      overflowY: "auto",
      marginTop: "4px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
      zIndex: 999,
      overflow: "hidden",
    },
    item: {
      padding: "0.5rem 0.75rem",
      color: "#cfcfd3",
      transition: "background 150ms",
      "&focused": {
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        color: "#ffffff",
      },
    },
  },
};
