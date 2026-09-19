import { useNavigate } from "react-router-dom";
import { registerNewUser } from "../services/ApiServices/AuthentificationServices";

const useRegister = () => {
  const navigate = useNavigate();

  const register = async (userName, password, passwordConfirm) => {
    if (!userName.trim()) {
      throw Error("Enter a username");
    }
    if (password === "") {
      throw Error("Enter a password");
    }
    if (password !== passwordConfirm) {
      throw Error("Passwords do not match");
    }
    await registerNewUser(userName.trim(), password);
    navigate("/");
  };

  return register;
};

export default useRegister;
