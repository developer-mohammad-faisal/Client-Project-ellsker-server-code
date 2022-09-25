const path = require("path");

module.exports = (folderName, fileName) => {
  const name = fileName?.endsWith("jpg") ? fileName : `${fileName}.jpg`;
  let filePath = path.join(
    __dirname,
    "..",
    "..",
    "client",
    "public",
    "images",
    folderName,
    `${name}`
  );
  if (process.env.NODE_ENV === "production") {
    filePath = path.join(
      __dirname,
      "..",
      "..",
      "client",
      "build",
      "images",
      folderName,
      `${name}`
    );
  }
  return filePath;
};
