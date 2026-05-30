import React, { useState } from 'react';
import { 
  Building, 
  Trees, 
  Sun, 
  Flame, 
  RotateCw, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Check, 
  Coins 
} from 'lucide-react';
import { PLAN_COSTS } from '../data';

interface WelcomeScreenProps {
  onJoinTrail: (
    plan: 'Starter' | 'Pro' | 'Pro Plus', 
    isAnnual: boolean, 
    email: string, 
    cardInfo?: { number: string; expiry: string; cvc: string; name: string }
  ) => void;
  onOpenSignIn: () => void;
}

type ZoningType = 'recreational' | 'solar' | 'subdivision';

export default function WelcomeScreen({ onJoinTrail, onOpenSignIn }: WelcomeScreenProps) {
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [zoningType, setZoningType] = useState<ZoningType>('recreational');
  const [rotateX, setRotateX] = useState(50);
  const [rotateY, setRotateY] = useState(-25);
  const [autoRotate, setAutoRotate] = useState(true);

  // Payment form states
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Pro Plus' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Auto animation effect simulating 3D rotation of the land parcel
  React.useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotateY(prev => (prev + 0.5) % 180);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Pricing plans selection - moves to step 3 (Card Input)
  const handleSelectPlan = (plan: 'Starter' | 'Pro' | 'Pro Plus') => {
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address first!");
      return;
    }
    setSelectedPlan(plan);
  };

  // Submit payment and validate card details prior to triggering account access
  const handleActivateTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      alert("Please enter a valid Credit Card number (at least 13-16 digits)!");
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      alert("Please enter a valid Expiry Date in MM/YY format!");
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      alert("Please enter a valid 3-digit CVV/CVC security code!");
      return;
    }
    if (!cardName) {
      alert("Please enter the Cardholder's full name!");
      return;
    }

    onJoinTrail(selectedPlan, isAnnual, email, {
      number: cardNumber.trim(),
      expiry: cardExpiry.trim(),
      cvc: cardCvc.trim(),
      name: cardName.trim(),
    });
  };

  // Zoning values mapping
  const zoningDetails = {
    recreational: {
      title: 'Camping & Recreational (Low Use)',
      buyPrice: 10000,
      resalePrice: 24500,
      roi: '145%',
      desc: 'Buy inexpensive rural woodland. Sell cash to weekend campers, hunters, and RV explorers.',
      icon: <Trees className="w-6 h-6 text-emerald-600" />,
      color: 'from-emerald-400 to-green-500',
      rendering: (
        <g transform="translate(100, 100)">
          {/* Tents and Trees */}
          <polygon points="0,-15 -12,10 12,10" fill="#ea580c" stroke="#fff" strokeWidth="1" />
          <polygon points="0,-15 -5,-3 5,-3" fill="#c2410c" />
          {/* Tree 1 */}
          <circle cx="-35" cy="-10" r="12" fill="#15803d" />
          <rect x="-37" y="2" width="4" height="15" fill="#78350f" />
          {/* Tree 2 */}
          <circle cx="35" cy="5" r="10" fill="#166534" />
          <rect x="33" y="15" width="4" height="15" fill="#78350f" />
        </g>
      )
    },
    solar: {
      title: 'Commercial Green Solar Lease',
      buyPrice: 25000,
      resalePrice: 68000,
      roi: '172%',
      desc: 'Sourced desert plats with clear solar coordinates. Flip to carbon offset syndicates looking for ready grids.',
      icon: <Sun className="w-6 h-6 text-amber-500 animate-pulse" />,
      color: 'from-amber-400 to-orange-500',
      rendering: (
        <g transform="translate(100, 100)">
          {/* Solar Panel Racks */}
          <rect x="-40" y="-30" width="30" height="20" fill="#1e3a8a" rx="2" stroke="#60a5fa" strokeWidth="1" />
          <line x1="-25" y1="-10" x2="-25" y2="15" stroke="#94a3b8" strokeWidth="3" />
          <rect x="10" y="-10" width="30" height="20" fill="#1e3a8a" rx="2" stroke="#60a5fa" strokeWidth="1" />
          <line x1="25" y1="10" x2="25" y2="25" stroke="#94a3b8" strokeWidth="3" />
          {/* Glowing yellow sun rays */}
          <circle cx="0" cy="-60" r="10" fill="#f59e0b" />
        </g>
      )
    },
    subdivision: {
      title: 'High-Density Housing Subdivision',
      buyPrice: 40000,
      resalePrice: 115000,
      roi: '187%',
      desc: 'Appraiser targets key boundary growth. High flip premium when wholesaled directly to major regional builders.',
      icon: <Building className="w-6 h-6 text-blue-600" />,
      color: 'from-blue-400 to-indigo-500',
      rendering: (
        <g transform="translate(100, 100)">
          {/* Grid lots with little houses */}
          <line x1="-80" y1="0" x2="80" y2="0" stroke="#cbd5e1" strokeDasharray="3" />
          <line x1="0" y1="-80" x2="0" y2="80" stroke="#cbd5e1" strokeDasharray="3" />
          {/* House 1 */}
          <rect x="-45" y="-45" width="25" height="20" fill="#ef4444" rx="1" />
          <polygon points="-45,-45 -32.5,-60 -20,-45" fill="#7f1d1d" />
          {/* House 2 */}
          <rect x="20" y="20" width="25" height="20" fill="#3b82f6" rx="1" />
          <polygon points="20,20 32.5,5 45,20" fill="#1e3a8a" />
        </g>
      )
    }
  };

  const selectedZoning = zoningDetails[zoningType];
  const wholesaleProfit = selectedZoning.resalePrice - selectedZoning.buyPrice;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Dynamic Pop-up Sourced Announcement */}
      <div className="bg-emerald-600 text-white py-2.5 px-4 text-xs font-black font-mono tracking-widest text-center flex items-center justify-center gap-2 uppercase relative z-20 shadow-sm">
        <Sparkles className="w-4 h-4 animate-bounce text-amber-300" />
        <span>7-DAY TRIAL ACTIVE: ALL SUBSCRIPTION PLANS INCLUDE $50 PROMOTIONAL MARKETING CREDITS!</span>
      </div>

      {/* Main welcome content header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex justify-between items-center bg-transparent">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl shadow-sm">
            <Building className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-widest uppercase text-slate-900">KingdomLand</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vacant Land wholesaling & Appraiser Sourcing</p>
          </div>
        </div>

        <button 
          onClick={onOpenSignIn}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-xs font-extrabold bg-white text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition duration-250 cursor-pointer uppercase tracking-wider"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Registered Member Sign In</span>
        </button>
      </header>

      {/* Body grids */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 pb-20 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left column capture */}
        <section className="lg:col-span-7 flex flex-col justify-between text-left pr-0 lg:pr-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
                Flipping Vacant Land Is <span className="text-emerald-600">Pure Gold</span>.
              </h2>
            </div>

            <p className="text-sm lg:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
              <strong>What is Land Wholesaling?</strong> Think of it as a low-risk strategic game: you find unused vacant dirt lots listed on dusty County public records. You agree to buy it cheap from owners who don't want it anymore, and immediately sell the lot to home builders or clean solar developers for a <strong className="text-emerald-700">huge profit markup</strong>! 
              <br/><br/>
              <span className="font-extrabold text-slate-800">The master play?</span> You never spend your own capital buying the land! You just source the contract and pocket the wholesaling price spread.
            </p>

            {/* Quick benefits checklist - sleek white containers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm py-2">
              {[
                { title: "Sourced Owner Records", desc: "Instantly extracts land registries from County offices" },
                { title: "Integrated USPS Mailers", desc: "Send 4x6, 6x9 postcards with automated offers" },
                { title: "Automatic Spreadsheet ROI", desc: "No formulas needed. Real profit calculations" },
                { title: "Compliant Data Safe", desc: "CCPA data lock secures landowner contacts" }
              ].map((b, i) => (
                <div key={i} className="flex gap-3 items-start bg-white p-3.5 rounded-xl border border-slate-200 transition duration-200 hover:scale-[1.02] shadow-sm">
                  <div className="text-emerald-600 font-black text-xl leading-none">&bull;</div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 leading-tight">{b.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Sourcing form to display subscription tier options */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-md space-y-4 max-w-xl">
              {!emailCaptured ? (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (email.includes('@')) setEmailCaptured(true); 
                  }} 
                  className="space-y-3.5"
                >
                  <label className="block text-[11px] font-black text-emerald-600 uppercase tracking-widest text-left">
                    Step 1: Enter your email address to unlock wholesale pricing plan tiers
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      required
                      placeholder="Enter your email to view subscriptions..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none transition-all focus:ring-1"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white font-black px-5 py-2.5 rounded-xl transition duration-200 hover:bg-emerald-500 hover:scale-105 select-none cursor-pointer flex items-center gap-1.5 uppercase tracking-wider text-xs shadow-sm"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Starts with a 7-day completely free trial. Cancel anytime with a 1-click button.</p>
                </form>
              ) : (
                <div className="space-y-4 animate-slide-down text-slate-800">
                  {selectedPlan ? (
                    <form onSubmit={handleActivateTrialSubmit} className="space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <div>
                          <strong className="text-xs text-emerald-600 font-extrabold uppercase tracking-wide flex items-center gap-1">
                            <span>🛡️ Step 3: Secure Trial Verification</span>
                          </strong>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">
                            Plan: <span className="font-mono text-slate-900 font-extrabold">{selectedPlan} Tier (${isAnnual ? PLAN_COSTS[selectedPlan].annual : PLAN_COSTS[selectedPlan].monthly}/{isAnnual ? 'yr' : 'mo'})</span>
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedPlan(null)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 underline font-extrabold cursor-pointer"
                        >
                          Change Tier
                        </button>
                      </div>

                      <div className="bg-emerald-50/55 p-3.5 rounded-xl border border-emerald-100 text-[11px] leading-relaxed text-slate-650">
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-700 font-black uppercase text-[9px] tracking-wider">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Zero-Charge Trial Authorized</span>
                        </div>
                        You will <strong className="text-slate-900 font-extrabold underline">NOT be charged today</strong>. Your 7-day completely free trial begins immediately. 
                        We will draft <strong className="text-slate-900 font-bold">${isAnnual ? PLAN_COSTS[selectedPlan].annual : PLAN_COSTS[selectedPlan].monthly}.00</strong> on <strong className="text-emerald-700 font-bold font-mono">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong> only if you choose to keep your subscription. Cancel in 1-click anytime!
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-1 text-left">
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">Cardholder Full Name</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Taylor Tycoon" 
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">Credit Card Number</label>
                          <input 
                            type="text" 
                            required
                            maxLength={19}
                            placeholder="4111 2222 3333 4444" 
                            value={cardNumber}
                            onChange={e => {
                              const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
                              const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                              setCardNumber(formatted);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1 text-left">
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">Expiration</label>
                            <input 
                              type="text" 
                              required
                              maxLength={5}
                              placeholder="MM/YY" 
                              value={cardExpiry}
                              onChange={e => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length > 2) {
                                  val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 text-center"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">CVV / CVC</label>
                            <input 
                              type="password" 
                              required
                              maxLength={4}
                              placeholder="•••" 
                              value={cardCvc}
                              onChange={e => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500 text-center"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl transition duration-200 select-none cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] shadow-sm"
                      >
                        <span>🚀 Activate my 7-Day Free Trial & $50 Gift</span>
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <div>
                          <strong className="text-xs text-emerald-600 font-extrabold uppercase tracking-wide">Step 2: Choose Sourcing Plan & Activate 7-Day Trial</strong>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">Capturing leads for: <span className="font-mono text-emerald-600">{email}</span></p>
                        </div>
                        <button 
                          onClick={() => setEmailCaptured(false)}
                          className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer"
                        >
                          Change Email
                        </button>
                      </div>

                      {/* Monthly vs Annual Toggle */}
                      <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-200">
                        <div>
                          <span className="text-xs font-black text-slate-900 block">Annual Sourcing Discount</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Save up to 20% on monthly subscriptions</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAnnual(!isAnnual)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            isAnnual ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isAnnual ? '✓ Annual Billing active' : 'Monthly (Click to Save 20%)'}
                        </button>
                      </div>

                      {/* Pricing grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['Starter', 'Pro', 'Pro Plus'] as const).map(p => {
                          const userLimit = p === 'Starter' ? '1 User Seat' : p === 'Pro' ? '3 User Seats' : '6 User Seats';
                          const features = p === 'Starter' 
                            ? ['Basic GIS searching', 'Standard mail rate', 'Local CRM persistent logs']
                            : p === 'Pro' 
                            ? ['Priority USPS rates', 'AI Sourcing assistant', 'Auto-Reload balance tools']
                            : ['Deep bulk USPS rates', 'Integrations developer API', 'Dedicated campaign advisor'];
                          
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => handleSelectPlan(p)}
                              className="bg-white border-2 border-slate-200 p-4 rounded-2xl hover:border-emerald-600 hover:shadow-lg text-left flex flex-col justify-between transition-all duration-200 group cursor-pointer text-slate-800"
                            >
                              <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                  <strong className="text-[11px] font-black text-slate-500 block uppercase tracking-wider group-hover:text-emerald-600 transition">{p} TIER</strong>
                                  <span className="text-[9px] bg-slate-900 text-white font-mono font-black px-1.5 py-0.5 rounded uppercase">
                                    {userLimit}
                                  </span>
                                </div>
                                <div className="my-1 text-slate-900">
                                  <span className="text-2xl font-mono font-black">
                                    ${isAnnual ? PLAN_COSTS[p].annual : PLAN_COSTS[p].monthly}
                                  </span>
                                  <span className="text-xs text-slate-500 font-bold">/mo</span>
                                </div>
                                
                                <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
                                  <span className="text-[9.5px] block text-emerald-600 font-black uppercase tracking-wider leading-none">
                                    Included Features:
                                  </span>
                                  <ul className="space-y-1 text-[10px] text-slate-550 list-inside list-disc">
                                    {features.map((f, i) => (
                                      <li key={i} className="leading-tight font-medium">{f}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <span className="text-[9px] block text-emerald-600 border-t border-slate-100 pt-1.5 font-bold uppercase leading-normal tracking-wider text-center">
                                   Starts with 7-Day Free Trial
                                </span>
                              </div>
                              <div className="mt-4 w-full bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-slate-800 py-2 rounded-xl text-[10px] font-black uppercase text-center tracking-wider transition">
                                Select {p} Options
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Credit Disclaimer */}
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 text-[10.5px] leading-relaxed flex items-start gap-2.5">
                        <span className="text-sm shrink-0">⚠️</span>
                        <div className="text-left">
                          <strong className="block font-black uppercase text-[9px] tracking-wider text-amber-800 mb-0.5">Promotional Sourcing Credit Policy</strong>
                          The free $50 credits are issued exclusively to first-time subscribers. This balance does not top up automatically on expiry. Everyone is responsible for purchasing and reloading their own campaign credits for outreach.
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="text-[10.5px] font-mono text-slate-400 mt-6 border-t border-slate-200 pt-4">
            KingdomLand matches actual land appraiser records and generates direct mail campaigns instantly. Licensed under nationwide real estate data provisions.
          </div>
        </section>

        {/* Right column: Interactive 3D development simulator */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-left">
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider font-mono">
                  Zoning & Development sandbox
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1 font-bold">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  Wholesaler ROI multiplier
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mt-2 text-slate-900 leading-snug">
                3D Interactive Land Model
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Rotate the 3D parcel on screen! Swap zoning types below to see how appraiser variables generate cash flow markups.
              </p>
            </div>

            {/* Zoning selector options inside model */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              {(['recreational', 'solar', 'subdivision'] as const).map(z => (
                <button
                  key={z}
                  onClick={() => setZoningType(z)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-black capitalize tracking-wider transition-all cursor-pointer ${
                    zoningType === z 
                      ? 'bg-white text-emerald-600 border border-slate-200 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-905 hover:bg-white/45'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* 3D RENDER CANVAS BODY */}
            <div className="relative h-[240px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Star details or grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-100"></div>

              {/* 3D Rotating land board container */}
              <div 
                className="w-[180px] h-[180px] relative transition-transform duration-100"
                style={{
                  transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(0deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                
                {/* 3D Extruded Soil Base under plate */}
                <div 
                  className="absolute inset-0 bg-[#542105] rounded-xl border-b-[18px] border-stone-900"
                  style={{
                    transform: 'translateZ(-18px)',
                    transformStyle: 'preserve-3d'
                  }}
                ></div>

                {/* 3D Grass Land top surface plate */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-xl border border-white/30 flex items-center justify-center p-4 shadow-xl">
                  {/* Grid contour line */}
                  <div className="absolute inset-2 border border-white/25 rounded-lg pointer-events-none"></div>

                  {/* Zoning Interactive Element render */}
                  <svg className="w-full h-full text-slate-800" viewBox="0 0 200 200">
                    {selectedZoning.rendering}
                  </svg>
                </div>

              </div>

              {/* Angle rotation instructions overlay */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white border border-slate-200 p-2.5 rounded-xl text-[10px] space-y-1.5 relative z-10 shadow-sm text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">3D rotation tools</span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-black select-none text-emerald-600">
                    <input 
                      type="checkbox" 
                      checked={autoRotate} 
                      onChange={e => setAutoRotate(e.target.checked)} 
                      className="rounded bg-slate-100 border-slate-350 text-emerald-600 focus:ring-0 w-3 h-3"
                    />
                    <span>Auto Spin</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-505 shrink-0 font-mono">Rotate slider:</span>
                  <input 
                    type="range" min="20" max="75" value={rotateX} 
                    onChange={e => { setRotateX(Number(e.target.value)); setAutoRotate(false); }}
                    className="w-full accent-emerald-650 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Zoning financial report cards */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2 text-slate-700">
              <div className="flex gap-2 items-center">
                {selectedZoning.icon}
                <strong className="text-slate-800 font-extrabold tracking-wide">{selectedZoning.title}</strong>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{selectedZoning.desc}</p>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 font-mono text-center">
                <div>
                  <span className="text-[9px] uppercase text-slate-555 block font-bold">We Buy Price</span>
                  <strong className="text-slate-800 font-bold">${selectedZoning.buyPrice.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-555 block font-bold">Wholesale Value</span>
                  <strong className="text-slate-800 font-bold">${selectedZoning.resalePrice.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-emerald-600 block font-bold">Net Profit Markup</span>
                  <strong className="text-emerald-600 font-black block mt-0.5">+{selectedZoning.roi} (+${wholesaleProfit.toLocaleString()})</strong>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-4 pt-1 bg-slate-550 border border-slate-200 p-2.5 rounded-xl text-[10.5px] leading-snug text-slate-600">
            <strong className="text-emerald-700 uppercase tracking-wide block mb-0.5 text-[9px] font-black">🚀 Why this model shines:</strong> Home developers actively search databases for acreage ready to buy. We automate extracting coordinates, zoning definitions, and building postcard offer dispatches in bulk.
          </div>

        </section>

      </main>
    </div>
  );
}
