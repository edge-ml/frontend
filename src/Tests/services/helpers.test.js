import { isNumber } from '../../services/helpers';

describe('Testing isNumber', () => {
  it('Positive Number', () => {
    const isNum = isNumber('223');
    expect(isNum).toBe(true);
  });

  it('Negative Number', () => {
    const isNum = isNumber('-223');
    expect(isNum).toBe(true);
  });
  it('Not a number', () => {
    const isNum = isNumber('abc');
    expect(isNum).toBe(false);
  });
});
