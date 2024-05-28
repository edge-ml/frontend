import Navbar from './components/Navbar/Navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="d-flex vh-100 vw-100">
      <Navbar></Navbar>
      <div className="overflow-auto vw-100 vh-100">{children}</div>
    </div>
  );
};

export default NavbarLayout;
