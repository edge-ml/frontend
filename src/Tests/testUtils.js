import fs from 'fs';
import path from 'path';

const fakeCsvPath = path.join(__dirname, 'fakeData', 'data_csv');

export const readFakeCsvFile = (filePath) => {
  const csv_dataset = path.join(fakeCsvPath, filePath);
  const fileData = fs.readFileSync(csv_dataset, 'utf-8');
  const file = new File([fileData], csv_dataset);
  return file;
};
