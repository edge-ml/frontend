import { generateRandomColor } from '../../services/ColorService';

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('generateRandomColor', () => {
  it('Check if it is a valid color', () => {
    const color = generateRandomColor();
    const test = /^#[0-9A-F]{6}$/i.test(color);
    expect(test).toBe(true);
  });

  it('Check if produced colors are different from each other', () => {
    const color1 = generateRandomColor();
    const color2 = generateRandomColor();
    expect(color1).not.toEqual(color2);
  });
});
