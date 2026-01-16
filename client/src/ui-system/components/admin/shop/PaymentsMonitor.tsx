import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

export interface PaymentTransaction {
  id: string;
  orderNumber: string;
  customerEmail: string;
  transactionId: string;
  paymentMethod: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export const PaymentsMonitor: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    // Skip API call - not implemented yet
    setTransactions([]);
    setLoading(false);
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = 'payments-list__status-badge';
    switch (status) {
      case 'completed': return `${baseClass} ${baseClass}--completed`;
      case 'pending': return `${baseClass} ${baseClass}--pending`;
      case 'processing': return `${baseClass} ${baseClass}--processing`;
      case 'failed': return `${baseClass} ${baseClass}--failed`;
      case 'cancelled': return `${baseClass} ${baseClass}--cancelled`;
      case 'refunded': return `${baseClass} ${baseClass}--refunded`;
      default: return baseClass;
    }
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case 'stripe': return 'credit-card';
      case 'paypal': return 'paypal';
      case 'yandex': return 'wallet';
      default: return 'credit-card';
    }
  };

  return (
    <div className="payments-monitor">
      <div className="payments-monitor__header">
        <h1 className="payments-monitor__title">Payments Monitor</h1>
        
        <div className="payments-monitor__filters">
          <select 
            className="payments-monitor__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="payments-monitor__loading">Loading payments...</div>
      ) : (
        <div className="payments-list">
          <div className="payments-list__header">
            <div className="payments-list__header-cell">Transaction ID</div>
            <div className="payments-list__header-cell">Order</div>
            <div className="payments-list__header-cell">Customer</div>
            <div className="payments-list__header-cell">Gateway</div>
            <div className="payments-list__header-cell">Amount</div>
            <div className="payments-list__header-cell">Status</div>
            <div className="payments-list__header-cell">Date</div>
          </div>

          {transactions && transactions.length > 0 && transactions.map((transaction) => (
            <div key={transaction.id} className="payments-list__row">
              <div className="payments-list__cell">
                <span className="payments-list__transaction-id">
                  {transaction.transactionId}
                </span>
              </div>
              
              <div className="payments-list__cell">
                <span className="payments-list__order-number">
                  {transaction.orderNumber}
                </span>
              </div>
              
              <div className="payments-list__cell">
                {transaction.customerEmail}
              </div>
              
              <div className="payments-list__cell">
                <div className="payments-list__gateway">
                  <Icon name={getGatewayIcon(transaction.gateway)} size={16} />
                  <span>{transaction.gateway}</span>
                </div>
              </div>
              
              <div className="payments-list__cell">
                <span className="payments-list__amount">
                  {transaction.currency} {transaction.amount}
                </span>
              </div>
              
              <div className="payments-list__cell">
                <span className={getStatusBadgeClass(transaction.status)}>
                  {transaction.status}
                </span>
              </div>
              
              <div className="payments-list__cell">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {(!transactions || transactions.length === 0) && !loading && (
            <div className="payments-list__empty">
              <Icon name="credit-card" size={48} />
              <p>No payment transactions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
