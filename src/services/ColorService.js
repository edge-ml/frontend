export const generateRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const hexToRgb = hex => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};

export const hexToForegroundColor = hex => {
  let color = hexToRgb(hex);
  if (!color) return '#000000';

  if (color.r * 0.299 + color.g * 0.587 + color.b * 0.114 > 186) {
    return '#000000';
  } else {
    return '#ffffff';
  }
};

export const isValidColor = color => {
  return /(^#[0-9A-F]{6}$)/i.test(color);
};
