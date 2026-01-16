import React from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';
import { useCart } from '../../../../store/cart-context';
import { useCheckout } from '../../../../store/checkout-context';

export const OrderSummary: React.FC = () => {
  const { items, totalAmount } = useCart();
  const { 
    customerInfo,
    paymentMethod, 
    prevStep, 
    submitOrder, 
    loading,
    error 
  } = useCheckout();

  const taxAmount: number = 0; // Calculate based on location
  const shippingAmount: number = 0; // Free shipping
  const finalTotal = totalAmount + taxAmount + shippingAmount;

  const handleSubmitOrder = async () => {
    try {
      await submitOrder();
    } catch (error) {
      console.error('Order submission failed:', error);
    }
  };

  return (
    <div className="order-summary">
      <div className="order-summary__header">
        <h2 className="order-summary__title">Review Your Order</h2>
      </div>

      {error && (
        <div className="order-summary__error">
          <Icon name="error" size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="order-summary__sections">
        {/* Order Items */}
        <div className="order-summary__section">
          <h3 className="order-summary__section-title">Order Items</h3>
          <div className="order-summary__items">
            {items.map((item) => (
              <div key={item.id} className="order-summary__item">
                <div className="order-summary__item-image">
                  {item.product?.image ? (
                    <img src={item.product.image} alt={item.product.title} />
                  ) : (
                    <Icon name="image" size={24} />
                  )}
                </div>
                
                <div className="order-summary__item-details">
                  <div className="order-summary__item-title">{item.product?.title}</div>
                  <div className="order-summary__item-quantity">Qty: {item.quantity}</div>
                </div>
                
                <div className="order-summary__item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Information */}
        <div className="order-summary__section">
          <h3 className="order-summary__section-title">Customer Information</h3>
          <div className="order-summary__address">
            <div>{customerInfo.firstName} {customerInfo.lastName}</div>
            <div>{customerInfo.email}</div>
            {customerInfo.phone && <div>{customerInfo.phone}</div>}
            {customerInfo.comments && (
              <div className="order-summary__comments">
                <strong>Comments:</strong> {customerInfo.comments}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="order-summary__section">
          <h3 className="order-summary__section-title">Payment Method</h3>
          <div className="order-summary__payment">
            {paymentMethod || 'No payment method selected'}
          </div>
        </div>

        {/* Order Total */}
        <div className="order-summary__section order-summary__section--total">
          <h3 className="order-summary__section-title">Order Total</h3>
          <div className="order-summary__totals">
            <div className="order-summary__total-row">
              <span>Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="order-summary__total-row">
              <span>Tax:</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="order-summary__total-row">
              <span>Shipping:</span>
              <span>{shippingAmount === 0 ? 'Free' : `$${shippingAmount.toFixed(2)}`}</span>
            </div>
            <div className="order-summary__total-row order-summary__total-row--final">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-summary__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={loading}
        >
          Back to Payment
        </Button>
        
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmitOrder}
          disabled={loading}
        >
          {loading ? (
            <>
              <Icon name="refresh" size={16} />
              Processing...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>
    </div>
  );
};
