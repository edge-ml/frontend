import { useNavigate } from 'react-router-dom';
import { registerNewUser } from '../services/ApiServices/AuthentificationServices';
import { validateEmail } from '../services/helpers';

const useRegister = () => {
  const navigate = useNavigate();

  const register = async (userName, email, password, passwordConfirm) => {
    if (!validateEmail(email)) {
      throw Error('Enter a valid e-mail');
    }
    if (password === '') {
      throw Error('Enter a password');
    }
    if (password !== passwordConfirm) {
      throw Error('Passwords do not match');
    }
    await registerNewUser(email, password, userName);
    navigate('/');
  };

  return register;
};

export default useRegister;
