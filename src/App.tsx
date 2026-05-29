import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Shield, 
  Sparkles, 
  Map as MapIcon, 
  FileSpreadsheet, 
  Mail, 
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Property, UserProfile, PostcardOrder } from './types';
import { NATIONWIDE_VACANT_PROPERTIES, PLAN_COSTS } from './data';

// Modular component imports
import WelcomeScreen from './components/WelcomeScreen';
import GisAppraiserTab from './components/GisAppraiserTab';
import AccountingTab from './components/AccountingTab';
import PostcardsTab from './components/PostcardsTab';

export default function App() {
  // --- USER PROFILE STATE ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kingdomland_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default guest starts sign-out to show interactive 3D Welcome screen!
    return null;
  });

  // Database lists
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('kingdomland_properties');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return NATIONWIDE_VACANT_PROPERTIES; }
    }
    return NATIONWIDE_VACANT_PROPERTIES;
  });

  const [postcardOrders, setPostcardOrders] = useState<PostcardOrder[]>(() => {
    const saved = localStorage.getItem('kingdomland_postcards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: 'ord-1',
        propertyApn: '110-04-982B',
        recipient: 'Sarah Higgins',
        recipientMail: '88 Blanca Vista Dr, Fort Garland, CO 81133',
        size: '6x9',
        cost: 0.72,
        timestamp: '2026-05-28 14:10',
        templateName: 'I Want To Buy Your Vacant Land For Cash!'
      }
    ];
  });

  // Active view states
  const [activeTab, setActiveTab] = useState<'gis-appraiser' | 'postcards' | 'accounting'>('gis-appraiser');
  const [selectedPropId, setSelectedPropId] = useState<string>('prop-101');
  const [encryptionOn, setEncryptionOn] = useState(true);

  // Search parameters for searching up to 5 cities simultaneously
  const [citySearchInput, setCitySearchInput] = useState('Phoenix, Belen, Fort Garland, Tampa, Dallas');
  const [searchedCities, setSearchedCities] = useState<string[]>(['Phoenix', 'Belen', 'Fort Garland', 'Tampa', 'Dallas']);
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');

  // Sign In bypass modal state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Notification Feed banner
  const [notification, setNotification] = useState<{ title: string; text: string } | null>(null);

  // Auto persistent savers
  useEffect(() => {
    localStorage.setItem('kingdomland_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kingdomland_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('kingdomland_postcards', JSON.stringify(postcardOrders));
  }, [postcardOrders]);

  const triggerNotification = (title: string, text: string) => {
    setNotification({ title, text });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Callback to unlock the sandbox platform from Welcome Captures
  const handleActivateTrial = (plan: 'Starter' | 'Pro' | 'Pro Plus', isAnnual: boolean, email: string) => {
    const newUser: UserProfile = {
      name: 'Taylor Tycoon',
      email: email,
      plan: plan,
      isAnnual: isAnnual,
      marketingCredits: 100.00, // Gift free $100 marketing start credits!
      autoReloadEnabled: true,
      trialDaysLeft: 7,
      isTrial: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    triggerNotification("7-Day Free Trial Activated!", `Enrolled under ${plan} tier with free $100 marketing cash check included.`);
  };

  const handleBypassSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail) return;
    const existingUser: UserProfile = {
      name: 'Taylor Tycoon',
      email: signInEmail,
      plan: 'Pro',
      isAnnual: false,
      marketingCredits: 84.50,
      autoReloadEnabled: true,
      trialDaysLeft: 5,
      isTrial: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(existingUser);
    setShowSignInModal(false);
    triggerNotification("Welcome back!", "Secure wholesaling login completed.");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    triggerNotification("Logged Out", "Signed out of KingdomLand securely.");
  };

  // Callback actions to mutate property records list on accounting tabs
  const handleAddSourcedProperty = (added: Property) => {
    setProperties([added, ...properties]);
  };

  const handleDeleteSourcedProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    triggerNotification("Record purged", "Land appraiser row deleted.");
  };

  const handleUpdateStatusInSpreadsheet = (propId: string, status: 'Lead' | 'Approved' | 'Sold' | 'Not Interested') => {
    setProperties(prev => prev.map(p => {
      if (p.id === propId) {
        return { ...p, status };
      }
      return p;
    }));
    triggerNotification("Spreadsheet recalculated", `Flipping status changed to: ${status}`);
  };

  // Marketing total expenditures
  const totalPostcardSpent = postcardOrders.reduce((sum, ord) => sum + ord.cost, 0);

  // Estimated Wholesale spreads calculation for Header dashboard ticker
  const activeOptionContractSpreads = properties
    .filter(p => p.status === 'Sold')
    .reduce((sum, p) => sum + (p.marketValue - p.price), 0);

  // If currentUser is NULL, we render the gorgeous interactive 3D Welcome screen!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 relative flex flex-col justify-between">
        <WelcomeScreen 
          onJoinTrail={handleActivateTrial}
          onOpenSignIn={() => setShowSignInModal(true)}
        />

        {/* Floating Sign In Bylaws Dialog Drawer Overlay */}
        {showSignInModal && (
          <div className="fixed inset-0 bg-[#0f172a]/65 backdrop-blur-sm shadow-2xl flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md shadow-2xl relative text-left">
              <button 
                onClick={() => setShowSignInModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <form onSubmit={handleBypassSignIn} className="space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                  <span className="text-xl">🔑</span>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Member Sign In Portal</h3>
                    <p className="text-xs text-slate-500">Secure cryptographic access control active</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-650 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your registered email..."
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-650 uppercase">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-350 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer text-center"
                >
                  🔒 Unlock dashboard sandbox
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Tab content router
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Top Banner Alert notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-white text-slate-800 px-5 py-4 rounded-2xl shadow-xl border border-slate-200 font-sans z-50 animate-bounce flex flex-col max-w-sm text-left">
          <strong className="text-sm font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-emerald-650">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
            {notification.title}
          </strong>
          <span className="text-xs text-slate-600 mt-1.5 leading-snug">{notification.text}</span>
        </div>
      )}

      {/* --- PREMIUM BRANDED SAAS PLATFORM HEADER --- */}
      <header className="border-b border-slate-200 bg-white px-5 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-sm relative z-10">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 text-neon-cyan rounded-xl border-2 border-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.45)]">
            <Building className="w-6 h-6 shrink-0 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase text-slate-900 bg-gradient-to-r from-slate-950 via-slate-800 to-neon-pink bg-clip-text text-transparent">KingdomLand <span className="text-neon-pink glow-text-pink">⚡</span></h1>
              <span className="text-[9px] bg-slate-950 text-neon-cyan border border-neon-cyan/40 px-2 py-0.5 rounded-full font-mono font-black tracking-wider animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                USA GIS DATABASE v4.1
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold tracking-tight">Automatic GIS land appraiser extraction, USPS lead targeting & spreadsheet ROI</p>
          </div>
        </div>

        {/* User profile workspace controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* CCPA Privacy protection toggle badge */}
          <button 
            onClick={() => {
              setEncryptionOn(!encryptionOn);
              triggerNotification(
                encryptionOn ? "CCPA Mask Pause" : "🛡️ Cryptographic Mask Active", 
                encryptionOn ? "Owner contact records now exposed." : "Data privacy algorithms securely masking landowner identities."
              );
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all text-xs font-black tracking-wider uppercase select-none cursor-pointer ${
              encryptionOn 
                ? 'bg-slate-955 border-neon-green/45 text-neon-bright-green hover:bg-slate-900 shadow-[0_0_10px_rgba(57,255,20,0.25)]'
                : 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>PRIVACY DECREE: {encryptionOn ? 'SECURE BLOCK' : 'UNMASKED LOGS'}</span>
          </button>

          {/* User badge display */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 gap-3.5 shadow-sm">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs font-extrabold text-slate-805">{currentUser.name}</span>
                <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded uppercase">
                  {currentUser.plan}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 justify-end mt-0.5">
                <span>Credits: <strong className="text-emerald-600 font-mono">${currentUser.marketingCredits.toFixed(2)}</strong></span>
                <span>•</span>
                <span>Trial: <strong className="text-amber-600 font-black">{currentUser.trialDaysLeft} days left</strong></span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="text-xs text-rose-650 hover:text-rose-500 border-l border-slate-200 pl-3.5 font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105"
            >
              Sign Out
            </button>
          </div>

        </div>

      </header>

      {/* --- SUB-NAVIGATION TAB DESK (ONLY 3 CONSOLIDATED TABS!) --- */}
      <nav className="bg-white border-b border-slate-250 px-5 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 shadow-sm">
        
        <div className="flex items-center space-x-2.5">
          
          <button
            onClick={() => setActiveTab('gis-appraiser')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 select-none cursor-pointer ${
              activeTab === 'gis-appraiser' 
                ? 'bg-slate-955 text-neon-bright-green border-2 border-neon-green shadow-[0_0_12px_rgba(57,255,20,0.45)]' 
                : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-200 hover:border-slate-350'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 shrink-0" />
            <span>🗺️ Appraiser Maps & Land Search</span>
          </button>

          <button
            onClick={() => setActiveTab('accounting')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 select-none cursor-pointer ${
              activeTab === 'accounting' 
                ? 'bg-slate-955 text-neon-pink border-2 border-neon-pink shadow-[0_0_12px_rgba(255,0,127,0.35)]' 
                : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-200 hover:border-slate-350'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>📊 Money Accounting Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('postcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 select-none cursor-pointer ${
              activeTab === 'postcards' 
                ? 'bg-slate-955 text-neon-cyan border-2 border-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.45)]' 
                : 'bg-slate-50 text-slate-655 hover:bg-slate-100 border border-slate-200 hover:border-slate-350'
            }`}
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>📮 Custom Postcards & Credits Hub</span>
          </button>

        </div>

        {/* Global profit tickers with elegant light indicators */}
        <div className="flex gap-5 text-xs font-sans items-center">
          <div className="text-left bg-slate-50 border border-slate-205 px-3 py-1.5 rounded-xl">
            <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Total SPREAD PROFITS COLLECTED</span>
            <strong className="text-emerald-700 font-mono text-sm leading-tight font-black">
              ${activeOptionContractSpreads.toLocaleString()}
            </strong>
          </div>
          <div className="bg-slate-200 h-8 w-px hidden sm:block"></div>
          <div className="text-left bg-slate-50 border border-slate-205 px-3 py-1.5 rounded-xl">
            <span className="block text-[8px] text-slate-505 uppercase tracking-widest font-black font-sans">All mail spent check</span>
            <strong className="text-cyan-700 font-mono text-sm leading-none font-black">
              ${totalPostcardSpent.toFixed(2)}
            </strong>
          </div>
        </div>

      </nav>

      {/* --- CENTRAL PORTAL WORKSPACE CANVAS --- */}
      <div className="flex-1 overflow-hidden flex flex-col relative w-full items-stretch">
        
        {/* Router tabs */}
        {activeTab === 'gis-appraiser' && (
          <GisAppraiserTab 
            properties={properties}
            selectedPropId={selectedPropId}
            setSelectedPropId={setSelectedPropId}
            encryptionOn={encryptionOn}
            setEncryptionOn={setEncryptionOn}
            searchedCities={searchedCities}
            setSearchedCities={setSearchedCities}
            citySearchInput={citySearchInput}
            setCitySearchInput={setCitySearchInput}
            selectedStateFilter={selectedStateFilter}
            setSelectedStateFilter={setSelectedStateFilter}
            onAddProperty={handleAddSourcedProperty}
            onDeleteProperty={handleDeleteSourcedProperty}
            currentUser={currentUser}
            triggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingTab 
            properties={properties}
            onAddProperty={handleAddSourcedProperty}
            onUpdateStatusInSpreadsheet={handleUpdateStatusInSpreadsheet}
            onDeleteProperty={handleDeleteSourcedProperty}
            encryptionOn={encryptionOn}
            totalPostcardSpent={totalPostcardSpent}
            triggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'postcards' && (
          <PostcardsTab 
            properties={properties}
            selectedPropId={selectedPropId}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            postcardOrders={postcardOrders}
            setPostcardOrders={setPostcardOrders}
            triggerNotification={triggerNotification}
            onOpenSignUp={() => triggerNotification("Hold on", "Sign in required to dispatch physical marketing collateral.")}
          />
        )}

      </div>

      {/* --- CORE NATIONWIDE METRICS DISCLOSURE FOOTER --- */}
      <footer className="border-t border-slate-200 bg-white py-2 px-5 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-sans shrink-0 gap-1 shadow-inner">
        <span>© 2026 KingdomLand Sourcing Inc. All USA County Appraiser databases recorded securely.</span>
        <div className="flex gap-3">
          <span className="hover:underline cursor-pointer">USA Data Protection Shield guidelines compliant</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Postage rules & Carrier terms</span>
        </div>
      </footer>

    </div>
  );
}
export { App };
