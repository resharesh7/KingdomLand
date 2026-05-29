import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  Database, 
  CreditCard, 
  Check, 
  Clock, 
  Shield, 
  HelpCircle, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Property, UserProfile, PostcardOrder } from '../types';
import { PLAN_COSTS } from '../data';

interface PostcardsTabProps {
  properties: Property[];
  selectedPropId: string;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  postcardOrders: PostcardOrder[];
  setPostcardOrders: React.Dispatch<React.SetStateAction<PostcardOrder[]>>;
  triggerNotification: (title: string, msg: string) => void;
  onOpenSignUp: () => void;
}

export default function PostcardsTab({
  properties,
  selectedPropId,
  currentUser,
  setCurrentUser,
  postcardOrders,
  setPostcardOrders,
  triggerNotification,
  onOpenSignUp
}: PostcardsTabProps) {

  // Custom visual templates states
  const [postcardSize, setPostcardSize] = useState<'4x6' | '6x9' | '6x11'>('6x9');
  const [postcardHeadline, setPostcardHeadline] = useState('I Want To Buy Your Vacant Land For Cash!');
  const [postcardBody, setPostcardBody] = useState('Dear Sourced Land landowner,\n\nI was indexing county records and noticed you own vacant tract APN: {APN}.\nWe can close fast in less than 7 days, pay standard closing escrow fees, and handle all Transfer Title paperwork.\n\nPlease call us today at +1 (800) 555-0192 to get your net cash offer!');
  const [postcardColor, setPostcardColor] = useState('#0f172a');

  const activeProperty = properties.find(p => p.id === selectedPropId) || properties[0];

  // Pricing matrix logic
  const getPostcardRate = (size: '4x6' | '6x9' | '6x11', plan: 'Starter' | 'Pro' | 'Pro Plus'): number => {
    const matrix = {
      '4x6': { 'Starter': 0.67, 'Pro': 0.62, 'Pro Plus': 0.57 },
      '6x9': { 'Starter': 0.73, 'Pro': 0.72, 'Pro Plus': 0.71 },
      '6x11': { 'Starter': 0.81, 'Pro': 0.79, 'Pro Plus': 0.77 }
    };
    return matrix[size][plan];
  };

  const currentPlan = currentUser?.plan || 'Pro';
  const postcardRate = getPostcardRate(postcardSize, currentPlan);

  // Send physical postcard and deduct credit bounds limit
  const handleDispatchPhysicalPostcard = () => {
    if (!currentUser) {
      onOpenSignUp();
      return;
    }
    if (!activeProperty) return;

    const rate = getPostcardRate(postcardSize, currentUser.plan);
    
    if (currentUser.marketingCredits < rate) {
      if (currentUser.autoReloadEnabled) {
        // Automatically replenish $50 at $0 limit
        setCurrentUser({
          ...currentUser,
          marketingCredits: Number(((currentUser.marketingCredits + 50.00) - rate).toFixed(2))
        });
        
        triggerNotification("🔄 Replenished Balance & Dispatched!", `Sent USPS ${postcardSize} mailer! Balance hit $0, auto-reloaded +$50.00 flat rates applied: ${(rate * 100).toFixed(0)}¢.`);
      } else {
        triggerNotification("Insufficient Mail Credits", `Please buy credits or toggle Auto-Reload within the Credit panel. Postcard cost: ${(rate * 100).toFixed(0)}¢.`);
        return;
      }
    } else {
      setCurrentUser({
        ...currentUser,
        marketingCredits: Number((currentUser.marketingCredits - rate).toFixed(2))
      });
    }

    const newOrder: PostcardOrder = {
      id: 'ord-' + Date.now(),
      propertyApn: activeProperty.apn,
      recipient: activeProperty.ownerName,
      recipientMail: activeProperty.ownerMailAddress,
      size: postcardSize,
      cost: rate,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      templateName: postcardHeadline
    };

    setPostcardOrders([newOrder, ...postcardOrders]);
    triggerNotification("📬 Postcard routed to USPS printer!", `Dispatched physical postcard to ${activeProperty.ownerName} mapping APN ${activeProperty.apn}.`);
  };

  const handleAddTenCreditsOverride = () => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      marketingCredits: Number((currentUser.marketingCredits + 25.00).toFixed(2))
    });
    triggerNotification("Loaded +$25.00 Marketing Credits", "Loaded postcard carrier allowance securely.");
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col xl:flex-row gap-5 text-left w-full bg-slate-50 text-slate-800 animate-fade-in">      {/* Visual template and copy builders */}
      <section className="flex-grow space-y-4 max-w-4xl bg-white p-5 border border-slate-200 rounded-2xl shadow-sm h-fit text-slate-800 hover:border-neon-pink/30 hover:shadow-[0_0_15px_rgba(255,0,127,0.12)] transition duration-300">
        
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Mail className="w-5 h-5 text-neon-pink shrink-0 animate-pulse" />
            <span className="glow-text-pink">Interactive USPS Postcard Design desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Draft physical paper mailers dispatched directly to the county appraiser target landowner</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-750 uppercase tracking-wide">Choose Postcard dimensions</label>
            <select
              value={postcardSize}
              onChange={e => setPostcardSize(e.target.value as any)}
              className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs font-bold text-slate-800 cursor-pointer outline-none focus:border-neon-pink"
            >
              <option value="4x6">Small Standard Classic 4" x 6" Postcard</option>
              <option value="6x9">Medium High-Impact 6" x 9" Postcard</option>
              <option value="6x11">Giant Premium Board 6" x 11" Postcard</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Postage rates matrix (Your Sourcing plan: {currentPlan})</span>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono pt-1">
              <div className={`p-1 rounded transition-all duration-300 ${postcardSize === '4x6' ? 'bg-slate-950 text-neon-pink border border-neon-pink/50 shadow-[0_0_10px_rgba(255,0,127,0.25)] font-black' : 'text-slate-450'}`}>
                <span className="block text-[8px] uppercase">4x6 Carrier</span>
                <strong>{(getPostcardRate('4x6', currentPlan) * 100).toFixed(0)}¢</strong>
              </div>
              <div className={`p-1 rounded transition-all duration-300 ${postcardSize === '6x9' ? 'bg-slate-950 text-neon-pink border border-neon-pink/50 shadow-[0_0_10px_rgba(255,0,127,0.25)] font-black' : 'text-slate-450'}`}>
                <span className="block text-[8px] uppercase">6x9 Carrier</span>
                <strong>{(getPostcardRate('6x9', currentPlan) * 100).toFixed(0)}¢</strong>
              </div>
              <div className={`p-1 rounded transition-all duration-300 ${postcardSize === '6x11' ? 'bg-slate-950 text-neon-pink border border-neon-pink/50 shadow-[0_0_10px_rgba(255,0,127,0.25)] font-black' : 'text-slate-450'}`}>
                <span className="block text-[8px] uppercase">6x11 Carrier</span>
                <strong>{(getPostcardRate('6x11', currentPlan) * 100).toFixed(0)}¢</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Custom postcard contents form templates */}
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-705 uppercase tracking-wide">Front Postcard Cover Headline (Attention Grabber)</label>
            <input 
              type="text" 
              value={postcardHeadline}
              onChange={e => setPostcardHeadline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-neon-cyan"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-705 uppercase tracking-wide">Postcard Offer Body Copy</label>
              <span className="text-[10px] text-neon-pink font-mono font-bold">Merge keyword: {"{APN}"}</span>
            </div>
            <textarea 
              rows={4}
              value={postcardBody}
              onChange={e => setPostcardBody(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-720 font-mono leading-relaxed outline-none focus:border-neon-cyan"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Choose Postcard Tint Accents (Color card style)</label>
            <div className="flex flex-wrap gap-2">
              {[
                { hex: '#0ea5e9', name: 'Premium Azure Blue', textHex: '#ffffff' },
                { hex: '#10b981', name: 'Sourced Emerald green', textHex: '#ffffff' },
                { hex: '#f43f5e', name: 'Kingdom Rose Pink', textHex: '#ffffff' },
                { hex: '#3b0764', name: 'Royal Violet Purple', textHex: '#ffffff' },
                { hex: '#1e293b', name: 'Slate Gray Obsidian', textHex: '#ffffff' }
              ].map(c => (
                <button
                  key={c.hex}
                  onClick={() => setPostcardColor(c.hex)}
                  className={`h-8 px-3 rounded-lg text-[10.5px] font-black transition-all duration-205 border cursor-pointer ${
                    postcardColor === c.hex 
                      ? 'border-slate-800 scale-[1.04] shadow-md' 
                      : 'border-transparent opacity-85 hover:opacity-100 hover:scale-[1.02]'
                  }`}
                  style={{ backgroundColor: c.hex, color: c.textHex }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient banner card */}
          {activeProperty && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="text-[9.5px] text-slate-450 font-mono uppercase tracking-widest block text-left">Active Destination Landowner Recipient:</span>
              <strong className="text-slate-805 font-extrabold text-sm block">👤 {activeProperty.ownerName}</strong>
              <p className="text-slate-700 font-mono text-[11px]">County listed mail address: <span className="font-bold text-emerald-600">{activeProperty.ownerMailAddress}</span></p>
              <p className="text-slate-500 text-[11px] font-mono">Sourced land parcel APN: <strong className="text-slate-800">{activeProperty.apn} ({activeProperty.acreage} AC)</strong></p>
            </div>
          )}

          {/* Action dispatch buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-t border-slate-200 pt-4 mt-2">
            <div>
              <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">Estimated postage stamp cost:</span>
              <strong className="text-base font-mono text-cyan-700 font-black">
                ${postcardRate.toFixed(2)} / Postcard dispatch
              </strong>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {currentUser && (
                <button
                  onClick={handleAddTenCreditsOverride}
                  className="bg-white hover:bg-slate-55 border border-slate-250 text-slate-755 px-3 py-2.5 rounded-xl text-xs font-black transition cursor-pointer select-none"
                >
                  🛠️ test loader (+$25)
                </button>
              )}

              <button
                onClick={handleDispatchPhysicalPostcard}
                className="flex-1 sm:flex-initial bg-slate-950 hover:bg-slate-900 border-2 border-neon-cyan text-neon-cyan font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-[0_0_12px_rgba(0,255,255,0.3)] hover:shadow-[0_0_18px_rgba(0,255,255,0.5)] cursor-pointer flex items-center justify-center gap-1.5 duration-200"
              >
                <span>🚀 Print & Dispatch physical postcard</span>
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* Credits hub & automatic postal replenishment controls sidebar */}
      <section className="w-full xl:w-[420px] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 shrink-0 flex flex-col justify-between text-slate-800 hover:border-neon-cyan/30 hover:shadow-[0_0_15px_rgba(0,255,255,0.12)] transition duration-300">
        
        <div className="space-y-4">
          
          <div className="border-b border-slate-250 pb-3">
            <h3 className="text-sm font-black text-slate-850 flex items-center gap-1.5 uppercase tracking-wide">
              <CreditCard className="w-4.5 h-4.5 text-neon-cyan shrink-0 animate-pulse" />
              <span className="glow-text-cyan">Credits Hub & Membership settings</span>
            </h3>
            <p className="text-[11px] text-slate-550 mt-0.5">Manage digital mailer account balances and automatic reloading systems</p>
          </div>

          {/* Balance sheet display */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold tracking-wider">Mailing credits balance</span>
            <strong className="text-3xl font-mono text-cyan-700 block font-black">
              ${currentUser ? currentUser.marketingCredits.toFixed(2) : '0.00'}
            </strong>
            <p className="text-[10px] text-slate-500 leading-normal font-sans">Dedicated solely to physical paper mailer carriers (separate from subscriptions).</p>
          </div>

          {/* Trial banner */}
          {currentUser?.isTrial && (
            <div className="space-y-2 text-left">
              <div className="bg-slate-50 border border-rose-200 text-slate-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs leading-snug shadow-sm">
                <Clock className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-rose-700">Active 7-Day trial suite:</strong>
                  <p className="mt-0.5 text-slate-650">You have <strong>{currentUser.trialDaysLeft} days left</strong> remaining on your chosen <strong>{currentUser.plan}</strong> wholesale tier.</p>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-rose-100 text-slate-600 p-3.5 rounded-xl text-[10.5px] leading-relaxed flex items-start gap-2">
                <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                <div>
                  <strong className="font-black uppercase text-[9.5px] tracking-wider text-rose-700 block mb-1">One-Time Trial Credit Policy disclaimer</strong>
                  The complimentary $100 mailing credits represent a limited-time bonus exclusively for first-time subscribers. Upon exhaustion, this promotional bonus will not be recurring. Each member of KingdomLand is individually responsible for refilling and purchasing their own postal credits to continue sending outbound campaign letters.
                </div>
              </div>
            </div>
          )}

          {/* Replenishment Reloading widgets */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <strong className="text-xs uppercase text-rose-705 tracking-wider block font-black font-mono">🔄 Automatic Postal Replenishment</strong>
            <p className="text-[11px] text-slate-550 leading-normal">To prevent mail campaign interruption, your account is configured to <strong>automatically reload $50.00</strong> when credits hit $0 unless paused or subscription is cancelled.</p>
            
            {currentUser ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                <div className="text-left font-sans">
                  <strong className="text-xs text-slate-800 block uppercase font-black">Status: {currentUser.autoReloadEnabled ? 'ACTIVE ARM' : 'PAUSED'}</strong>
                  <span className="text-[10px] text-slate-500 block font-bold mt-0.5">+$50.00 reload on empty</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser({
                      ...currentUser,
                      autoReloadEnabled: !currentUser.autoReloadEnabled
                    });
                    triggerNotification("Auto-Reload Toggle changed", currentUser.autoReloadEnabled ? "Replenishment paused." : "Reload active.");
                  }}
                  className={`text-xs font-black p-2 rounded-lg transition shrink-0 cursor-pointer ${
                    currentUser.autoReloadEnabled 
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250' 
                      : 'bg-white text-slate-505 border border-slate-250 hover:bg-slate-50'
                  }`}
                >
                  {currentUser.autoReloadEnabled ? 'Pause Reload' : 'Activate Reload'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-505 text-left font-mono">Sign in to change auto-reload.</p>
            )}

            {currentUser && (
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono uppercase tracking-wide text-[9.5px]">Test reloading manually:</span>
                <button
                  onClick={() => {
                    setCurrentUser({
                      ...currentUser,
                      marketingCredits: currentUser.marketingCredits + 50.00
                    });
                    triggerNotification("Mailing Credits Refilled", "Manually loaded +$50.00 postcard value.");
                  }}
                  className="bg-white hover:bg-slate-100 text-emerald-700 font-black border border-emerald-300 p-1.5 px-3 rounded-xl cursor-pointer text-[10.5px] shadow-sm font-sans"
                >
                  🔁 Refill $50.00
                </button>
              </div>
            )}
          </div>

          {/* Upgrade Membership Selectors */}
          <div className="space-y-2">
            <strong className="text-[9.5px] font-mono uppercase text-slate-505 tracking-widest block font-black font-sans">🏷️ Select / Upgrade Sourcing Plan</strong>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {(['Starter', 'Pro', 'Pro Plus'] as const).map(p => {
                const isSelected = currentUser?.plan === p;
                return (
                  <div 
                    key={p} 
                    className={`p-3 rounded-xl border flex justify-between items-center transition duration-155 ${
                      isSelected ? 'bg-slate-50 border-neon-cyan/80 ring-2 ring-neon-cyan/25 shadow-[0_0_12px_rgba(0,255,255,0.18)]' : 'bg-slate-50 border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div>
                      <strong className="text-slate-800 block uppercase text-[10.5px] font-extrabold">{p} SUITE</strong>
                      <span className="text-[10px] text-slate-500 font-mono font-bold block mt-0.5">
                        ${currentUser?.isTrial ? 'Trial' : (currentUser?.isAnnual ? PLAN_COSTS[p].annual : PLAN_COSTS[p].monthly)+'/mo billing'}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="text-[9px] bg-slate-950 text-neon-cyan border border-neon-cyan/40 font-extrabold px-2 py-0.5 rounded uppercase font-mono shadow-sm">
                        Your Tier
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (!currentUser) return;
                          setCurrentUser({ ...currentUser, plan: p });
                          triggerNotification("Sourcing Membership Modified", `Changed suite plan limit level to ${p}`);
                        }}
                        className="text-[10px] bg-white text-emerald-700 hover:bg-slate-100 font-black p-1 px-2.5 rounded-lg border border-emerald-300 transition cursor-pointer uppercase font-mono tracking-widest"
                      >
                        Change Select
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Audit history tracker */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-left space-y-2.5 mt-4">
          <strong className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block">
            📜 USPS mailer Dispatch Auditing ({postcardOrders.length})
          </strong>
          
          <div className="space-y-2 max-h-48 overflow-y-auto font-mono">
            {postcardOrders.map(ord => (
              <div key={ord.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center gap-2 animate-fade-in hover:border-emerald-550 duration-200 shadow-sm">
                <div className="text-left font-sans flex-1">
                  <strong className="text-slate-800 block font-bold">Mail To: {ord.recipient}</strong>
                  <p className="text-slate-500 text-[10px] leading-tight mt-0.5">Dest: {ord.recipientMail}</p>
                  <span className="text-[9.5px] text-emerald-700 font-bold block mt-1 font-mono">APN: {ord.propertyApn} &bull; size {ord.size}</span>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-rose-600 font-bold block font-bold">-${ord.cost.toFixed(2)}</span>
                  <span className={`text-[8.5px] bg-emerald-50 border border-emerald-250 text-emerald-700 px-1.5 py-0.5 ${ord.cost === 0 ? 'text-slate-400' : ''} rounded font-black font-sans uppercase`}>SENT</span>
                </div>
              </div>
            ))}

            {postcardOrders.length === 0 && (
              <p className="text-slate-450 text-center font-mono py-4 text-[11px]">No active postcard audits. Pick a property and mail!</p>
            )}
          </div>
        </div>

      </section>

    </div>
  );
}
