import Navbar from './components/Navbar/Navbar';

const NavbarLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <Navbar></Navbar>
      {children}
    </div>
  );
};

export default NavbarLayout;
