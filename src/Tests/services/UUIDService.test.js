import { uuidv4 } from '../../services/UUIDService';
import Adapter from 'enzyme-adapter-react-16';

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Test if different UUIDs are returned', () => {
  const uuid_one = uuidv4();
  const uuid_two = uuidv4();
  const uuid_three = uuidv4();

  expect(uuid_one).not.toEqual(uuid_two);
  expect(uuid_two).not.toEqual(uuid_three);
  expect(uuid_three).not.toEqual(uuid_one);
});
