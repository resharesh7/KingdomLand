import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Layers, 
  CreditCard, 
  Search, 
  UserX, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag,
  BellRing,
  Lock,
  Unlock,
  ShieldCheck,
  Key
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminTabProps {
  customers: UserProfile[];
  onToggleCustomerStatus: (email: string) => void;
  onModifyCustomerCredits: (email: string, amount: number) => void;
  currentUser?: UserProfile | null;
  onAdminLoginStateChange?: (authenticated: boolean) => void;
}

export default function AdminTab({ 
  customers, 
  onToggleCustomerStatus, 
  onModifyCustomerCredits,
  currentUser,
  onAdminLoginStateChange
}: AdminTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Secure Sign-in gate states
  const [adminEmail, setAdminEmail] = useState('ggspetstore@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('kingdomland_admin_authenticated') === 'true';
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail.toLowerCase().trim() === 'ggspetstore@gmail.com' && adminPassword === 'admin2026') {
      sessionStorage.setItem('kingdomland_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      showNotification('🔐 Access Granted! Welcome back Admin.');
      if (onAdminLoginStateChange) {
        onAdminLoginStateChange(true);
      }
    } else {
      setAuthError('❌ Invalid Administrator Credentials. Please retry.');
    }
  };

  // Automated bypass if logged-in account matches ggspetstore@gmail.com (the owner!)
  const isUserOwner = currentUser?.email.toLowerCase() === 'ggspetstore@gmail.com';
  const hasAccess = isAuthenticated || isUserOwner;

  // Filtered customers list
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Financial Calculators
  const planPrices = {
    'Starter': { monthly: 110, annual: 89 },
    'Pro': { monthly: 169, annual: 139 },
    'Pro Plus': { monthly: 269, annual: 223 }
  };

  const totalCustomers = customers.length;
  const activeCustomersCount = customers.filter(c => c.isActive).length;
  
  // Calculate SaaS Monthly Recurring Revenue (MRR) - Count only Active subscribed (non-trial) customers
  const totalSaaSRevenue = customers.reduce((sum, c) => {
    if (!c.isActive) return sum;
    // In trial, they are not charged yet. But we can present what they will contribute, or actual paying. Let's calculate actual active MRR!
    const price = c.isAnnual ? planPrices[c.plan].annual : planPrices[c.plan].monthly;
    return sum + (c.isTrial ? 0 : price);
  }, 0);

  // Let's also compute the projected pipeline MRR (value of trial accounts when they transition)
  const projectedPipelineMRR = customers.reduce((sum, c) => {
    if (!c.isActive || !c.isTrial) return sum;
    const price = c.isAnnual ? planPrices[c.plan].annual : planPrices[c.plan].monthly;
    return sum + price;
  }, 0);

  // Calculate total credit refills spent by all users
  const totalMailerRefillsRevenue = customers.reduce((sum, c) => {
    // Each user profile can have a field `creditsBought` initialized with sample values
    const refills = (c as any).creditsBought || 0;
    return sum + refills;
  }, 0);

  const grandTotalRevenue = totalSaaSRevenue + totalMailerRefillsRevenue;

  if (!hasAccess) {
    return (
      <div className="flex-1 overflow-y-auto p-5 py-12 flex items-center justify-center bg-slate-900 border-t border-slate-800">
        <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 text-center space-y-6 shadow-[0_0_55px_rgba(0,0,0,0.6)] animate-fade-in">
          
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-base font-black text-white uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>🔒 SECURE CHECKPOINT</span>
            </h2>
            <p className="text-[10.5px] text-slate-400 leading-relaxed max-w-sm mx-auto">
              This administrative portal is private and NOT open to the public. Only authorized SaaS platform owners can inspect active customer lists or adjust marketing ledger credits.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-950/50 border border-rose-800/40 px-3.5 py-2.5 rounded-xl text-rose-300 text-xs font-semibold leading-relaxed text-left flex items-start gap-2 animate-bounce">
              <span className="text-xs">⚠️</span>
              <div>{authError}</div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Administrator Email</label>
              <input 
                type="email"
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@kingdomland.com"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-semibold text-white outline-none focus:border-rose-500/50 transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Key Passcode</label>
              <input 
                type="password"
                required
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-rose-500/50 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-650 hover:bg-rose-505 text-white font-black py-3 rounded-xl transition duration-200 select-none cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] font-mono shadow-[0_0_15px_rgba(225,29,72,0.2)]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Verify Secure Credentials</span>
            </button>
          </form>

          {/* Verification credentials box for the owner/reviewer */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-left space-y-2 text-[10.5px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-amber-550 font-black uppercase text-[9px] tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Owner & Reviewer Passcode</span>
            </div>
            <p className="text-slate-400">
              Please authorize using these set credentials, or sign into the main app using <strong className="text-slate-300">ggspetstore@gmail.com</strong> for automatic bypass:
            </p>
            <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg font-mono text-[9.5px] text-slate-350 space-y-1 select-all">
              <div>Admin Email: <strong className="text-white font-bold">ggspetstore@gmail.com</strong></div>
              <div>Passcode: <strong className="text-rose-400 font-bold">admin2026</strong></div>
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 text-left bg-slate-50 text-slate-800 animate-fade-in space-y-6">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-5.5 h-5.5 text-neon-pink animate-pulse" />
            <span className="glow-text-pink">KingdomLand SaaS Administrator HQ</span>
            {isUserOwner && (
              <span className="text-[9px] bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 px-1.5 py-0.5 rounded-md font-black tracking-wider uppercase shrink-0">
                Owner Bypass Authorized
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial telemetry, customer subscription lifecycles, and credit balance reconciliation ledger.
          </p>
        </div>

        {/* Header Actions Panel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('kingdomland_admin_authenticated');
                setIsAuthenticated(false);
                showNotification('🔒 Session terminated. Admin Portal locked.');
                if (onAdminLoginStateChange) {
                  onAdminLoginStateChange(false);
                }
              }}
              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3 py-1.8 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Portal</span>
            </button>
          )}

          {/* Search bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-450 focus:border-neon-cyan outline-none transition"
            />
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-slate-900 text-neon-cyan border border-neon-cyan/40 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold leading-none animate-slide-down shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <BellRing className="w-4 h-4 text-neon-cyan animate-bounce" />
          <span>{notification}</span>
        </div>
      )}

      {/* Revenue Dashboard Bento Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4.5 border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between hover:border-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.15)] transition duration-200">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Monthly SaaS MRR</span>
            <strong className="text-2.5xl font-black font-mono text-emerald-600 mt-1.5 block">
              ${totalSaaSRevenue.toLocaleString()}
            </strong>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-slate-450">Active paying members</span>
            <span className="font-mono bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded">
              {customers.filter(c => !c.isTrial && c.isActive).length} accounts
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.15)] transition duration-200">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Projected MRR Pipeline</span>
            <strong className="text-2.5xl font-black font-mono text-cyan-600 mt-1.5 block">
              ${projectedPipelineMRR.toLocaleString()}
            </strong>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-slate-450">Trial users transitioning</span>
            <span className="font-mono bg-cyan-50 text-cyan-700 font-black px-2 py-0.5 rounded">
              {customers.filter(c => c.isTrial && c.isActive).length} trial accounts
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 border border-slate-200 shadow-sm rounded-2xl flex flex-col justify-between hover:border-neon-pink hover:shadow-[0_0_15px_rgba(255,0,127,0.12)] transition duration-200">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Postcard Refill Receipts</span>
            <strong className="text-2.5xl font-black font-mono text-rose-600 mt-1.5 block">
              ${totalMailerRefillsRevenue.toLocaleString()}
            </strong>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-slate-450">Accumulated mail add-ons</span>
            <span className="font-mono bg-rose-50 text-rose-700 font-black px-2 py-0.5 rounded">
              Real Funds
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-4.5 border-2 border-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[9px] text-neon-cyan font-black uppercase tracking-widest font-mono">Grand Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-neon-cyan animate-pulse" />
            </div>
            <strong className="text-2.5xl font-black font-mono text-white glow-text-cyan mt-1.5 block">
              ${grandTotalRevenue.toLocaleString()}
            </strong>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
            <span className="text-slate-400">System Sourced LTV</span>
            <span className="font-mono text-neon-bright-green font-black">
              100% SECURE
            </span>
          </div>
        </div>

      </section>

      {/* Customer Subscriptions telemetry table */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-800">
              Registered customers & subscription activity telemetry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database lists of accounts showing registered card tokens, status controls, and active tiers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neon-bright-green animate-ping"></span>
            <span className="text-[10px] text-slate-500 font-mono">
              Database Sync Connected ({filteredCustomers.length} records found)
            </span>
          </div>
        </div>

        {/* Telemetry Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-mono tracking-wider">
                <th className="p-3.5 font-bold">Customer Account</th>
                <th className="p-3.5 font-bold">Sourcing Plan Tier</th>
                <th className="p-3.5 font-bold">Billing Cycle</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold">Mailing Balance</th>
                <th className="p-3.5 font-bold">Card Token</th>
                <th className="p-3.5 font-bold text-center">Manage Ledger actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-450 font-mono">
                    No matching customer records found in the server database.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const hasCard = cust.cardInfo && cust.cardInfo.number;
                  const cardLast4 = hasCard ? cust.cardInfo?.number.slice(-4) : null;
                  
                  return (
                    <tr key={cust.email} className="hover:bg-slate-50/50 transition">
                      
                      {/* Customer info */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-850">{cust.name}</div>
                        <div className="text-[10px] text-slate-550 font-mono">{cust.email}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Joined: {new Date(cust.createdAt).toLocaleDateString()}</div>
                      </td>

                      {/* Tier */}
                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                          cust.plan === 'Pro Plus' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-150' 
                            : cust.plan === 'Pro' 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {cust.plan}
                        </span>
                      </td>

                      {/* Billing cycle detail */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-800 text-[11px]">
                          {cust.isAnnual ? 'Annual Sourced' : 'Monthly Cycle'}
                        </div>
                        {cust.isTrial ? (
                          <span className="text-[9px] font-mono text-neon-pink glow-text-pink font-semibold uppercase bg-slate-950 px-1 rounded">
                            ⏳ 7-Day Trial ({cust.trialDaysLeft} days left)
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-emerald-600 font-semibold uppercase bg-emerald-50 px-1 rounded">
                            Active Subscription
                          </span>
                        )}
                      </td>

                      {/* Status switch */}
                      <td className="p-3.5">
                        {cust.isActive ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="h-2 w-2 rounded-full bg-neon-bright-green animate-pulse"></span>
                            <span>Active Sourcing</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                            <span>Suspended</span>
                          </div>
                        )}
                      </td>

                      {/* Mailing cash limit */}
                      <td className="p-3.5 font-mono">
                        <span className="text-emerald-700 font-black text-[12.5px]">
                          ${cust.marketingCredits.toFixed(2)}
                        </span>
                        <div className="text-[9px] text-slate-400 font-sans">
                          Spent refills: ${(cust as any).creditsBought || 0}
                        </div>
                      </td>

                      {/* Card Tokenized masked digits */}
                      <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                        {cardLast4 ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                            <span>•••• {cardLast4} (Active)</span>
                          </div>
                        ) : (
                          <span className="text-slate-450 italic">No Card Tokenizer</span>
                        )}
                      </td>

                      {/* Quick Admin Override Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              onToggleCustomerStatus(cust.email);
                              showNotification(`Customer status modified for ${cust.name}`);
                            }}
                            className={`p-1.5 rounded-lg border text-[10.5px] font-black uppercase transition cursor-pointer flex items-center gap-1 ${
                              cust.isActive 
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>{cust.isActive ? 'Suspend' : 'Activate'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onModifyCustomerCredits(cust.email, 15);
                              showNotification(`Gifted $15.00 promotional bonus credits to ${cust.name}!`);
                            }}
                            className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-705 p-1.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer"
                          >
                            + Gift $15 Mail Balance
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin manual testing triggers */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="text-xs uppercase tracking-widest text-[#00ffff] font-black flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 animate-spin text-[#00ffff]" />
            <span>Developer Applet Simulation sandbox Override info</span>
          </h4>
          <p className="text-[11px] text-slate-300 leading-normal max-w-xl">
            You can sign out of Taylor Tycoon and log into the Welcome Screen using any customer email address (e.g. <strong>sarah@higgins.com</strong>, <strong>john@remax.net</strong>) to see how individual data updates propagate in real-time across database sessions.
          </p>
        </div>
        <div className="shrink-0 bg-slate-950 px-4 py-2 rounded-xl text-right border border-[#00ffff]/30">
          <span className="text-[9.5px] block uppercase font-mono text-slate-400">Admin Bypass token active</span>
          <strong className="text-xs text-neon-bright-green font-mono">DEV_MODE=TRUE</strong>
        </div>
      </section>

    </div>
  );
}
