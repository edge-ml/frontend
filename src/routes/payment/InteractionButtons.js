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
  console.log(subscriptionLevel);
  if (subscriptionLevel !== 'standard' && buttonLevel === 'standard') {
    return <Button disabled>Base Level</Button>;
  }
  return (
    <Button
      color="success"
      onClick={(e) =>
        subscriptionLevel === buttonLevel
          ? accessPortal(customerId)
          : checkout(priceId, customerId)
      }
    >
      {subscriptionLevel === buttonLevel ? 'Manage Subscription' : 'Buy Now'}
    </Button>
  );
};
