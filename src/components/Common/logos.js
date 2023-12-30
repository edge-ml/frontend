import LogoTeco from '../../assets/teco_logo.png';
import LogoKIT from '../../assets/KITlogo_4c_englisch.png';

export const TECOLogo = (props) => {
  return <img {...props} src={LogoTeco}></img>;
};
export const KITLogo = (props) => {
  return <img {...props} src={LogoKIT}></img>;
};
