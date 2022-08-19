import React from 'react';
import {
  accessPortal,
  checkout,
} from '../../services/ApiServices/PaymentService';
import { Button } from 'reactstrap';

export const InteractionButton = ({
  subscriptionLevel,
  buttonLevel,
  priceId,
  customerId,
}) => {
  if (buttonLevel === 'standard') {
    return <Button disabled>Base Level</Button>;
  }
  if (subscriptionLevel === 'unlimited' && buttonLevel !== 'unlimited') {
    return <Button disabled>Buy Now</Button>;
  }
  return (
    <Button
      color="success"
      onClick={(e) =>
        subscriptionLevel !== 'standard'
          ? accessPortal(customerId)
          : checkout(priceId, customerId)
      }
    >
      {subscriptionLevel === buttonLevel ? 'Manage Subscription' : 'Buy Now'}
    </Button>
  );
};
