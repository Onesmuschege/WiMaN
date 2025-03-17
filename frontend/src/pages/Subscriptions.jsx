import { useState, useEffect } from 'react';
import { userService, mpesaService } from '../services/apiService';
import subscriptionService from '../services/subscriptionService';

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch subscription plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const result = await subscriptionService.getSubscriptionPlans();
        if (result.success && result.data) {
          setPlans(result.data);
        } else {
          setError('Failed to load subscription plans');
        }
      } catch (err) {
        setError('An error occurred while loading subscription plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Handle plan selection
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
    setPaymentStatus(null);
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formattedPhone = phoneNumber.startsWith('254') 
        ? phoneNumber 
        : `254${phoneNumber.replace(/^0/, '')}`;
      
      const result = await mpesaService.initiatePayment(formattedPhone, selectedPlan.price);
      
      if (result.success) {
        setPaymentStatus({
          status: 'initiated',
          message: 'Payment request sent to your phone. Please complete the payment by entering your M-PESA PIN.'
        });
        
        const subscribeResult = await userService.subscribeToPlan(selectedPlan.id);
        
        if (subscribeResult.success) {
          setPaymentStatus({
            status: 'success',
            message: 'Payment successful! Your subscription has been activated.'
          });
        } else {
          setPaymentStatus({
            status: 'error',
            message: 'Payment successful, but subscription activation failed. Please contact support.'
          });
        }
      } else {
        setPaymentStatus({
          status: 'error',
          message: result.error || 'Payment initiation failed. Please try again.'
        });
      }
    } catch (err) {
      setPaymentStatus({
        status: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && plans.length === 0) {
    return <div className="loading-container">Loading subscription plans...</div>;
  }

  return (
    <div className="subscriptions-container">
      <h1>Subscription Plans</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {!showPaymentForm ? (
        <>
          <p className="subscription-intro">Choose a subscription plan that works for you to access all WIMAN features.</p>
          <div className="plans-grid">
            {plans.map(plan => (
              <div key={plan.id} className="plan-card">
                <h3>{plan.name}</h3>
                <p>KES {plan.price}</p>
                <p>{plan.speed}, {plan.devices}</p>
                <button onClick={() => handleSelectPlan(plan)}>Select Plan</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="payment-section">
          <h2>Complete Your Subscription</h2>
          <p>Plan: {selectedPlan.name}</p>
          <p>Price: KES {selectedPlan.price}</p>
          <form onSubmit={handlePaymentSubmit}>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone number" required />
            <button type="submit">Pay with M-PESA</button>
          </form>
          {paymentStatus && (
            <div className={`alert alert-${paymentStatus.status}`}>
              {paymentStatus.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
