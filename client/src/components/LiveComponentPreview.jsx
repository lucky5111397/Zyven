import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LiveProvider,
  LivePreview,
  LiveError,
} from "react-live";

import { motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";

const extractCodeString = (input) => {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof input !== "object") return "";

  const candidates = [
    input.code,
    input.component?.code,
    input.component,
    input.parsed?.code,
    input.parsed,
    input.jsx,
    input.content,
    input.source,
    input.data?.component?.code,
    input.data?.code,
    input.code?.code,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
  }

  return "";
};

const tryParseJSON = (str) => {
  if (
    !str ||
    typeof str !== "string" ||
    !str.trim().startsWith("{")
  ) {
    return null;
  }

  try {
    const obj = JSON.parse(str.trim());
    if (obj && typeof obj === "object") {
      const inner = extractCodeString(obj);
      if (inner) return inner;
    }
  } catch {
    // not valid JSON
  }
  return null;
};

const unescapeJsonString = (code) => {
  if (typeof code !== "string") return code;
  if (!code.includes("\\n") && !code.includes('\\"')) return code;

  let result = code;
  result = result.replace(/\\n/g, "\n");
  result = result.replace(/\\t/g, "\t");
  result = result.replace(/\\r/g, "\r");
  result = result.replace(/\\"/g, '"');
  result = result.replace(/\\\\/g, "\\");
  return result;
};

const stripMarkdownFences = (code) => {
  let result = code;
  result = result.replace(
    /^```(?:jsx|javascript|js|react|tsx|typescript|ts|html)?\s*/im,
    ""
  );
  result = result.replace(/\s*```\s*$/im, "");
  result = result.replace(/^```\s*/gm, "");
  result = result.replace(/\s*```$/gm, "");
  return result.trim();
};

const stripImportsExports = (code) => {
  let result = code;
  // Match multi-line and single-line imports safely by stopping at the first 'from'
  result = result.replace(
    /^\s*import\s+(?:(?!\bfrom\b)[\s\S])*?\s+from\s+['"][^'"]*['"];?\s*$/gm,
    ""
  );
  // Match single-line import without 'from' e.g. import "styles.css";
  result = result.replace(
    /^\s*import\s+['"][^'"]*['"];?\s*$/gm,
    ""
  );
  // Match dynamic imports
  result = result.replace(
    /^\s*import\s*\([\s\S]*?\)\s*;?\s*$/gm,
    ""
  );
  result = result.replace(
    /^\s*export\s+default\s+[A-Za-z_$][A-Za-z0-9_$]*\s*;?\s*$/gm,
    ""
  );
  result = result.replace(
    /^\s*export\s+\{[^}]*\}\s*;?\s*$/gm,
    ""
  );
  result = result.replace(
    /\bexport\s+default\s+/g,
    ""
  );
  result = result.replace(
    /\bexport\s+(?=(?:const|let|var|function|class)\b)/g,
    ""
  );
  return result;
};

const stripTypeAnnotations = (code) => {
  let result = code;
  result = result.replace(
    /:\s*React\.FC(?:<[^>]*>)?\s*=/g,
    " ="
  );
  result = result.replace(
    /:\s*React\.(?:FunctionComponent|ComponentType|Component)(?:<[^>]*>)?\s*=/g,
    " ="
  );
  result = result.replace(
    /\)\s*:\s*(?:JSX\.Element|React\.ReactNode|React\.ReactElement|ReactElement|ReactNode|void|null|any|string|number|boolean)\s*(?:=>|\{)/g,
    (match) => {
      if (match.includes("=>")) return ") =>";
      return ") {";
    }
  );
  result = result.replace(
    /(?:interface|type)\s+[A-Z][A-Za-z0-9_]*(?:<[^>]*>)?\s*(?:extends\s+[^{]*)?\{[^}]*\}\s*;?\s*\n?/g,
    ""
  );
  return result;
};

const fixCommonSyntaxIssues = (code) => {
  let result = code;
  result = result.replace(
    /position\s*:\s*["']fixed["']/gi,
    'position: "relative"'
  );
  result = result.replace(
    /position\s*:\s*fixed/gi,
    'position: "relative"'
  );
  result = result.replace(/\bReactDOM\b/g, "React");
  result = result.replace(/\bReact\.createElement\b/g, "React.createElement");
  result = result.replace(
    /\brequire\s*\(\s*['"][^'"]*['"]\s*\)/g,
    "null"
  );
  return result;
};

const detectComponentName = (code) => {
  if (!code) return null;

  const patterns = [
    /\b(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>/,
    /\b(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=\s*function\b/,
    /\bfunction\s+([A-Z][A-Za-z0-9_]*)\s*\(/,
    /\bclass\s+([A-Z][A-Za-z0-9_]*)/,
    /\b(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=/,
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const hasBalancedBraces = (code) => {
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === "{" || ch === "(") depth++;
    if (ch === "}" || ch === ")") depth--;

    if (depth < 0) return false;
  }

  return depth === 0;
};

const hasJSXContent = (code) => {
  return /<[A-Za-z][^>]*>/.test(code) || /React\.createElement/.test(code);
};

const sanitizeCode = (rawInput) => {
  let code = extractCodeString(rawInput);
  if (!code || typeof code !== "string") return "";

  code = code.trim();

  const jsonResult = tryParseJSON(code);
  if (jsonResult) code = jsonResult;

  code = unescapeJsonString(code);
  code = stripMarkdownFences(code);

  if (
    code.trim().startsWith("{") &&
    code.includes('"code"')
  ) {
    const jsonRetry = tryParseJSON(code);
    if (jsonRetry) code = jsonRetry;
    code = unescapeJsonString(code);
    code = stripMarkdownFences(code);
  }

  code = stripImportsExports(code);
  code = stripTypeAnnotations(code);
  code = fixCommonSyntaxIssues(code);

  code = code.replace(/^\s*\n/gm, "");
  code = code.trim();

  return code;
};

const buildWrappedCode = (sanitized) => {
  if (!sanitized) return "";

  if (/\brender\s*\(/.test(sanitized)) {
    return sanitized;
  }

  const componentName = detectComponentName(sanitized);

  if (componentName) {
    return `${sanitized}\n\nrender(<${componentName} />);`;
  }

  if (hasJSXContent(sanitized)) {
    const lines = sanitized.trim().split("\n");
    const firstLine = lines[0].trim();
    if (firstLine.startsWith("<")) {
      return `render(\n${sanitized}\n);`;
    }
  }

  return `render(${sanitized});`;
};

const validateCode = (code) => {
  if (!code || typeof code !== "string" || !code.trim()) {
    return { valid: false, reason: "empty" };
  }

  const trimmed = code.trim();

  if (trimmed.length < 10) {
    return { valid: false, reason: "too_short" };
  }

  if (!hasJSXContent(trimmed) && !detectComponentName(trimmed)) {
    return { valid: false, reason: "no_component" };
  }

  if (!hasBalancedBraces(trimmed)) {
    return { valid: false, reason: "unbalanced" };
  }

  return { valid: true };
};

export const LiveComponentPreview = ({ code, fallbackMessage = "No generated code available." }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshPreview = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const sanitized = useMemo(() => {
    return sanitizeCode(code);
  }, [code]);

  const validation = useMemo(() => {
    return validateCode(sanitized);
  }, [sanitized]);

  const wrappedCode = useMemo(() => {
    if (!validation.valid) return "";
    return buildWrappedCode(sanitized);
  }, [sanitized, validation]);

  const scope = useMemo(
    () => ({
      React,
      useState,
      useEffect,
      useMemo,
      useCallback,
      useRef,
      motion,
      Math,
      Date,
      Array,
      Object,
      JSON,
      console,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Promise,
      Map,
      Set,
      Symbol,
      Number,
      String,
      Boolean,
      RegExp,
      Error,
    }),
    []
  );

  if (!sanitized || !validation.valid) {
    let errorMessage = fallbackMessage;

    if (validation.reason === "too_short") {
      errorMessage = "Generated code is too short to render.";
    } else if (validation.reason === "no_component") {
      errorMessage = "No valid React component found in the generated code.";
    } else if (validation.reason === "unbalanced") {
      errorMessage = "Generated code has syntax issues. Try generating again.";
    }

    return (
      <div
        style={{
          width: "100%",
          minHeight: "360px",
          borderRadius: "14px",
          background: "#020617",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "#94a3b8",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
        }}
      >
        <span style={{ fontSize: "28px", opacity: 0.4 }}>⚠</span>
        {errorMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "400px",
        overflow: "hidden",
      }}
    >
      <motion.button
        type="button"
        onClick={refreshPreview}
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{
          scale: 0.9,
          rotate: 90,
        }}
        title="Refresh preview"
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          zIndex: 50,
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(30,41,59,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#cbd5e1",
          borderRadius: "9px",
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
        }}
      >
        <FiRefreshCw size={16} />
      </motion.button>

      <LiveProvider
        key={refreshKey}
        code={wrappedCode}
        scope={scope}
        noInline={true}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          style={{
            width: "100%",
            minHeight: "400px",
            boxSizing: "border-box",
            border:
              "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            background: "#020617",
            position: "relative",
            overflow: "auto",
            padding:
              "clamp(16px, 3vw, 28px)",
          }}
        >
          <LivePreview />
        </motion.div>

        <LiveError
          style={{
            marginTop: "10px",
            padding: "12px 14px",
            background:
              "rgba(127,29,29,0.35)",
            color: "#f87171",
            border:
              "1px solid rgba(248,113,113,0.25)",
            borderRadius: "9px",
            fontSize: "12px",
            lineHeight: "1.6",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        />
      </LiveProvider>
    </div>
  );
};

export default LiveComponentPreview;