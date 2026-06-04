window.EDutiFileHandler = (function () {
  const allowedExtensions = ["pdf", "jpeg", "jpg", "png", "gif"];
  const largeFileBytes = 5 * 1024 * 1024;

  function getExtension(fileName) {
    const parts = String(fileName || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function isAllowedFile(file) {
    return allowedExtensions.includes(getExtension(file.name));
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };
      reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
      reader.readAsDataURL(file);
    });
  }

  async function processFiles(fileList) {
    const accepted = [];
    const errors = [];
    const warnings = [];
    const files = Array.from(fileList || []);

    for (const file of files) {
      if (!isAllowedFile(file)) {
        errors.push(`${file.name}: Only PDF, JPEG, JPG, PNG and GIF files are allowed.`);
        continue;
      }
      if (file.size > largeFileBytes) {
        warnings.push(`${file.name} is larger than 5 MB. It will be included, but XML preview and download may be slower.`);
      }
      const base64 = await readFileAsBase64(file);
      accepted.push({ name: file.name, size: file.size, base64 });
    }

    return { accepted, errors, warnings };
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index += 1;
    }
    return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  return { processFiles, formatBytes };
})();
