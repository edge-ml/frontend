import React from 'react';

import { Table, Button } from 'reactstrap';
import {
  accessPortal,
  checkout,
  getCustomerId,
  getProducts,
} from '../../services/ApiServices/PaymentService';
import { useAsyncMemo } from '../../services/ReactHooksService';
import Loader from '../../modules/loader';

const PaymentPage = () => {
  const products = useAsyncMemo(async () => await getProducts(), [], []);
  const customerId = useAsyncMemo(
    async () => (await getCustomerId()).customerId,
    []
  );
  const features = {
    trainingTime: 'Training Time',
    storage: 'Storage',
    parallelJobs: 'Parallel Jobs',
    optimization: 'Optimization',
    hasEngineer: 'Dedicated Success Engineer',
    whiteLabel: 'White Label',
    pricing: 'Pricing',
    billing: 'Billed',
    deployment: 'Deployment',
  };
  const dev = products.find((x) => x.details.title === 'Dev');
  const proPlus = products.find((x) => x.details.title === 'Pro+');
  const pro = products.find((x) => x.details.title === 'Pro');
  return (
    <Loader loading={!products}>
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ fontSize: '1.20rem' }}
      >
        {products.length > 0 && (
          <Table
            className="table-borderless"
            style={{ marginLeft: '4rem', marginRight: '8rem' }}
          >
            <thead>
              <tr>
                <th style={{ width: '12%' }}></th>
                <th
                  style={{ width: '12%', paddingLeft: '4rem' }}
                  className="text-center"
                >
                  {dev.details.title}
                </th>
                <th style={{ width: '10%' }} className="text-center">
                  {proPlus.details.title}
                </th>
                <th style={{ width: '12%' }} className="text-center">
                  {pro.details.title}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(features).map(([k, v]) => {
                return (
                  <tr>
                    <td style={{ width: '12%' }}>{v}</td>
                    <td
                      style={{ width: '12%', paddingLeft: '4rem' }}
                      className="text-center"
                    >
                      {dev.details[k]}
                    </td>
                    <td
                      style={{ width: '10%' }}
                      className="text-center font-weight-bold"
                    >
                      {proPlus.details[k]}
                    </td>
                    <td style={{ width: '12%' }} className="text-center">
                      {pro.details[k]}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ width: '12%' }}></td>
                <td
                  style={{ width: '12%', paddingLeft: '4rem' }}
                  className="text-center"
                >
                  <Button
                    color="success"
                    onClick={(e) => accessPortal(customerId)}
                  >
                    View Subscription
                  </Button>
                </td>
                <td style={{ width: '10%' }} className="text-center">
                  <Button
                    color="success"
                    onClick={(e) => checkout(proPlus.priceId, customerId)}
                  >
                    Buy Now
                  </Button>
                </td>
                <td style={{ width: '12%' }} className="text-center">
                  <Button
                    color="success"
                    onClick={(e) => checkout(pro.priceId, customerId)}
                  >
                    Buy Now
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        )}
      </div>
      {/* <div
        className="card"
        style={{
          position: "absolute",
          top: "60px",
          left: "585px",
          width: "260px",
          height: "570px",
          backgroundColor: "#F3F3F3",
          borderRadius: "8px",
          zIndex: "-2",
        }}>

      </div> */}
      {/* <div
        className="card"
        style={{
          position: "absolute",
          top: "60px",
          left: "865px",
          width: "250px",
          height: "570px",
          backgroundColor: "#F3F3FF",
          borderRadius: "8px",
          zIndex: "-1",
        }}
      >

      </div> */}
    </Loader>
  );
};

export default PaymentPage;
