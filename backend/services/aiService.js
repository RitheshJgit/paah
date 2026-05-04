import fs from "fs";

export const analyzeImage = (file) => {
  const filePath = file.path;

  if (!fs.existsSync(filePath)) {
    return { score: 1, valid: false, flags: ["file_missing"] };
  }

  const stats = fs.statSync(filePath);

  let score = 50;
  let flags = [];

  // 🔥 File size logic
  if (stats.size < 5000) {
    score -= 30;
    flags.push("too_small");
  }

  if (stats.size > 2000000) {
    score -= 10;
    flags.push("too_large");
  }

  // 🔥 File type
  if (!file.mimetype.includes("image")) {
    score = 0;
    flags.push("not_image");
  }

  return {
    score: Math.max(score, 1),
    valid: score >= 30,
    flags
  };
};