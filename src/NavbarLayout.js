import Navbar from './components/Navbar/Navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="d-flex vh-100">
      <Navbar></Navbar>
      <div className="overflow-auto">{children}</div>
    </div>
  );
};

export default NavbarLayout;
