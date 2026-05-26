import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Crown, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type Plan = {
  id: string;
  name: string;
  monthly: number;
  annual: number;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  { id: 'seeker', name: 'Seeker', monthly: 0, annual: 0, features: ['Basic jaap counter', 'Profile streaks', 'Daily almanac'] },
  { id: 'devotee', name: 'Devotee', monthly: 101, annual: 1000, features: ['Full jaap history', 'Ad-free experience', 'All puja vidhis'], popular: true },
  { id: 'sadhak', name: 'Sadhak', monthly: 251, annual: 2500, features: ['Unlimited AI palmistry', 'Custom reminders', 'Priority support'] },
  { id: 'guru', name: 'Guru Dakshina', monthly: 501, annual: 5000, features: ['Monthly consult note', 'Exclusive content', 'Tulsi mala gift record'] }
];

const icons = {
  seeker: <Star className="w-6 h-6 text-stone-500" />,
  devotee: <Shield className="w-6 h-6 text-rose-700" />,
  sadhak: <Crown className="w-6 h-6 text-amber-700" />,
  guru: <div className="w-6 h-6 rounded-full bg-stone-950 text-amber-100 flex items-center justify-center font-serif font-bold text-xs">ॐ</div>
};

export default function Subscription() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateBilling = (field: keyof typeof billingDetails, value: string) => {
    setBillingDetails((current) => ({ ...current, [field]: value }));
  };

  const activatePlan = async () => {
    if (!selectedPlan) return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setIsSaving(true);
    setMessage('');

    try {
      const amount = billingCycle === 'annual' ? selectedPlan.annual : selectedPlan.monthly;
      const response = await api.post<{ message: string }>('/subscriptions', {
        userId,
        plan: selectedPlan.id,
        billingCycle,
        amount,
        billingDetails,
        paymentMethod
      });
      setMessage(response.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save subscription.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden pb-24">
      <header className="p-4 pt-6 bg-[#2b1d16]/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-amber-500/20">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-amber-100/70 hover:text-amber-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-serif text-amber-50">Offerings</h1>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif text-amber-50 mb-2">Choose Your Path</h2>
          <p className="text-sm text-amber-100/70">Plans are saved to your account with billing details.</p>
        </div>

        <div className="flex bg-amber-100/10 p-1 rounded-xl max-w-xs mx-auto border border-amber-200/20">
          {(['monthly', 'annual'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                billingCycle === cycle ? 'bg-amber-100 text-stone-950 shadow-sm' : 'text-amber-100/70 hover:text-amber-100'
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {plans.map((plan, index) => {
          const price = billingCycle === 'annual' ? plan.annual : plan.monthly;
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1 }}
              className={`bg-[#fff8ea]/90 backdrop-blur-md p-6 rounded-[1.75rem] shadow-sm border-2 relative overflow-hidden ${
                plan.popular ? 'border-rose-400 shadow-rose-100' : isSelected ? 'border-amber-500' : 'border-amber-200/70'
              }`}
            >
              {plan.popular && <div className="absolute top-0 right-0 bg-rose-700 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">Most Popular</div>}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100">
                    {icons[plan.id as keyof typeof icons]}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-stone-950">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-stone-950">{price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}/${billingCycle === 'annual' ? 'yr' : 'mo'}`}</span>
                      {billingCycle === 'annual' && price > 0 && <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">Save 17%</span>}
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-stone-700">
                    <Check className="w-5 h-5 shrink-0 text-rose-700" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan)}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  isSelected ? 'bg-rose-700 text-white' : 'bg-stone-950 text-amber-50 hover:bg-stone-800'
                }`}
              >
                {isSelected ? 'Selected' : plan.id === 'seeker' ? 'Use Free Plan' : 'Select Plan'}
              </button>
            </motion.div>
          );
        })}

        {selectedPlan && (
          <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-[#fff8ea]/95 border border-amber-200/70 rounded-[1.75rem] p-5 space-y-3 shadow-sm" onSubmit={(event) => { event.preventDefault(); activatePlan(); }}>
            <h3 className="font-serif text-xl text-stone-950">Billing Details</h3>
            <p className="text-sm text-stone-600">Payment integration setup is in progress. Enjoy free version till then</p>
            <div className="grid grid-cols-1 gap-3">
              <input required placeholder="Full name" value={billingDetails.fullName} onChange={(event) => updateBilling('fullName', event.target.value)} className="px-4 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" />
              <input required type="email" placeholder="Email for receipt" value={billingDetails.email} onChange={(event) => updateBilling('email', event.target.value)} className="px-4 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" />
              <input required placeholder="Phone" value={billingDetails.phone} onChange={(event) => updateBilling('phone', event.target.value.replace(/[^\d+]/g, ''))} className="px-4 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" />
              <input placeholder="Address" value={billingDetails.address} onChange={(event) => updateBilling('address', event.target.value)} className="px-4 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="City" value={billingDetails.city} onChange={(event) => updateBilling('city', event.target.value)} className="px-3 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 min-w-0" />
              <input placeholder="State" value={billingDetails.state} onChange={(event) => updateBilling('state', event.target.value)} className="px-3 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 min-w-0" />
              <input placeholder="PIN" value={billingDetails.pincode} onChange={(event) => updateBilling('pincode', event.target.value.replace(/\D/g, ''))} className="px-3 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500 min-w-0" />
            </div>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white/90 outline-none focus:ring-2 focus:ring-amber-500">
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net banking</option>
            </select>
            {message && <p className="text-sm text-rose-700">{message}</p>}
            <button disabled={isSaving} className="w-full py-3 rounded-xl bg-rose-700 text-white font-medium disabled:opacity-50">
              {isSaving ? 'Saving...' : selectedPlan.id === 'seeker' ? 'Activate Free Plan' : 'Save & Continue to Payment'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
