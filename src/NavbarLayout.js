import Navbar from './components/Navbar/Navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="d-flex vh-100 vw-100">
      <Navbar></Navbar>
      <div className="overflow-auto flex-grow-1">{children}</div>
    </div>
  );
};

export default NavbarLayout;
