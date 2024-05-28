import { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import logoSvg from '../../logo.svg';

const DataLossPage = ({ children }) => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const lastAcceptanceDate = localStorage.getItem('lastAcceptanceDate');
    if (lastAcceptanceDate) {
      const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
      const currentDate = new Date();
      const lastAcceptance = new Date(lastAcceptanceDate);
      if (currentDate - lastAcceptance < oneWeekInMilliseconds) {
        setAccepted(true);
      }
    }
  }, []);

  const acceptDataLoss = () => {
    localStorage.setItem('lastAcceptanceDate', new Date().toISOString());
    setAccepted(true);
  };

  if (accepted) {
    return children;
  }

  return (
    <>
      {children}
      <div
        className="d-flex justify-content-center align-items-center vh-100 vw-100 flex-column font-weight-bold position-absolute fixed-top left-0 z-index-10000"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
      >
        <div className="d-flex align-items-center m-5">
          <img
            style={{ marginRight: '8px', width: '100px' }}
            src={logoSvg}
            alt="Logo"
          />
          <b>
            <div style={{ color: 'black', fontSize: '40px' }}>edge-ml</div>
          </b>
        </div>
        <h2 className="m-2 text-center">This is an edge-ml beta deployment.</h2>
        <h2 className="m-2 text-center">
          Data, including your account, may get deleted at any time.
        </h2>
        <Button
          size="lg"
          className="m-5"
          color="primary"
          onClick={acceptDataLoss}
        >
          Accept
        </Button>
      </div>
    </>
  );
};

export default DataLossPage;
