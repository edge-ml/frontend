const extractheader = async (file) => {
  const CHUNK_SIZE = 128;
  const decoder = new TextDecoder();
  let offset = 0;
  let results = "";
  const fr = new FileReader();

  fr.onload = () => {
    results += decoder.decode(fr.result, { stream: true });
    const lines = results.split("\n");
    if (lines.length > 1) {
      resolve(lines[0]);
    }
    results = lines.pop();
    offset += CHUNK_SIZE;
    seek();
  };

  fr.onerror = () => {
    throw Error("Could not parse header");
  };

  const seek = () => {
    if (offset >= file.size) {
      resolve(results);
      return;
    }
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    fr.readAsArrayBuffer(slice);
  };
};

const processFile = () => {};

module.exports = {
  extractheader: extractheader,
};
