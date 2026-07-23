export const extractHeader = (file) => {
  return new Promise((resolve, reject) => {
    const CHUNK_SIZE = 128;
    const decoder = new TextDecoder();
    let offset = 0;
    let results = "";
    const fr = new FileReader();

    fr.onload = function () {
      results += decoder.decode(fr.result, { stream: true });
      const lines = results.split("\n");
      if (lines.length > 1) {
        resolve(lines[0]);
      }
      results = lines.pop();
      offset += CHUNK_SIZE;
      seek();
    };

    fr.onerror = function () {
      reject(fr.error);
    };

    seek();

    function seek() {
      if (offset >= file.size) {
        resolve(results);
        return;
      }
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      fr.readAsArrayBuffer(slice);
    }
  });
};

export const parseHeader = (header) => {
  const fields = header.split(",").map((f) => f.trim());
  const invalid = fields.find(
    (f) => !f.startsWith("sensor_") && !f.startsWith("label_") && f != "time"
  );
  if (invalid || fields.length < 2) {
    return [undefined, undefined];
  }
  const unitPattern = /\[([^\[\]]*)\]$/;
  const timeSeries = fields
    .filter((f) => f.startsWith("sensor_"))
    .map((f, idx) => {
      const match = f.match(unitPattern);
      const name = match ? f.slice(7, match.index) : f.slice(7);
      const unit = match ? match[1] : "";
      return {
        name: name,
        originalName: name,
        unit: unit,
        originalUnit: unit,
        removed: false,
        index: idx,
        scale: 1,
        offset: 0,
      };
    });
  const labelings = fields
    .filter((f) => f.startsWith("label_"))
    .map((f) => {
      const [, labeling, label] = f.split("_");
      return {
        name: label,
        labelingItBelongs: labeling,
      };
    })
    .reduce((acc, label) => {
      const idx = acc.findIndex(
        (labeling) => labeling.name === label.labelingItBelongs
      );
      if (idx >= 0) {
        acc[idx].labels.push(label.name);
        acc[idx].indices.push(label.index);
      } else {
        acc.push({
          name: label.labelingItBelongs,
          originalName: label.labelingItBelongs,
          removed: false,
          labels: [label.name],
          indices: [0],
        });
      }
      return acc;
    }, [])
    .map((labeling, index) => ({ ...labeling, index: index }));
  return [timeSeries, labelings];
};
