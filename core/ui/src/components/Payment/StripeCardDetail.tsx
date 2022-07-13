import './card-payment-form.less';
import React from 'react';
import { useElements, useStripe, CardCvcElement, CardNumberElement, CardExpiryElement } from '@stripe/react-stripe-js';
import {
  CreatePaymentMethodCardData,
  CreatePaymentMethodData,
  PaymentMethod,
  PaymentMethodResult,
  StripeCardNumberElementOptions
} from '@stripe/stripe-js';
import { ConfirmStripePaymentParams, PaymentMethodType } from '@liqnft/candy-shop-types';
import { LoadingSkeleton } from 'components/LoadingSkeleton';

const Logger = 'CandyShopUI/CardPaymentModal';

export interface StripeCardDetailProps {
  paymentId: string;
  shopAddress: string;
  tokenAccount: string;
  onClickedPayCallback: (param: ConfirmStripePaymentParams) => void;
}

export const StripeCardDetail: React.FC<StripeCardDetailProps> = ({
  paymentId,
  shopAddress,
  tokenAccount,
  onClickedPayCallback
}) => {
  const stripe = useStripe();
  const stripeElements = useElements();

  if (!stripe || !stripeElements) {
    console.log(`${Logger}: Loading Stripe.js`);
    return <LoadingSkeleton />;
  }

  const getPaymentMethod = (paymentMethodData: CreatePaymentMethodData): Promise<PaymentMethod> => {
    return stripe.createPaymentMethod(paymentMethodData).then((result: PaymentMethodResult) => {
      if (result.error) {
        throw result.error;
      }
      if (!result.paymentMethod) {
        throw Error('Undefined PaymentMethod');
      }
      return result.paymentMethod;
    });
  };

  // TODO: Check element change to enable/disable Pay button

  const getConfirmPaymentParams = async () => {
    const cardPaymentElement = stripeElements.getElement('cardNumber');
    if (!cardPaymentElement) {
      throw Error('Abort submit payment, StripePaymentElement is null');
    }
    const paymentMethodData: CreatePaymentMethodCardData = {
      type: 'card',
      card: cardPaymentElement
    };
    const paymentMethod = await getPaymentMethod(paymentMethodData);
    const params: ConfirmStripePaymentParams = {
      paymentId,
      paymentMethodId: paymentMethod.id,
      shopId: shopAddress,
      tokenAccount
    };
    return params;
  };

  const onClickedPay = () => {
    getConfirmPaymentParams()
      .then((res: ConfirmStripePaymentParams) => {
        onClickedPayCallback(res);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: getConfirmPaymentParams failed, err=`, err);
      });
  };

  return (
    <div className="card-payment-modal-container">
      <div className="candy-title">Credit Card</div>
      <CardNumberElement options={numberOptions} />
      <div style={{ display: 'flex' }}>
        <div style={{ width: '40%' }}>
          <CardExpiryElement options={expOptions} />
        </div>
        <div style={{ width: '60%' }}>
          <CardCvcElement />
        </div>
      </div>
      <button className="candy-button card-payment-modal-button" onClick={onClickedPay}>
        Pay
      </button>
    </div>
  );
};

// TODO: Customize CardElement styling by overriding stripe's style
const numberOptions: StripeCardNumberElementOptions = {
  placeholder: '00-00-00-00',
  style: {
    base: {
      color: 'blue',
      fontSize: '24px',
      '::placeholder': {
        color: '#87BBFD'
      }
    }
  }
};
const expOptions: StripeCardNumberElementOptions = {
  style: {
    base: {
      backgroundColor: 'pink',
      padding: '4px'
    }
  }
};
