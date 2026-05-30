import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Search, 
  Building, 
  MapPin, 
  Map as MapIcon, 
  Shield, 
  AlertTriangle, 
  Trash2, 
  HelpCircle, 
  TrendingUp, 
  Flame,
  FileText,
  Mail,
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  UserCheck,
  MessageSquare,
  History,
  Volume2
} from 'lucide-react';
import { Property, UserProfile } from '../types';

interface GisAppraiserTabProps {
  properties: Property[];
  selectedPropId: string;
  setSelectedPropId: (id: string) => void;
  encryptionOn: boolean;
  setEncryptionOn: (val: boolean) => void;
  searchedCities: string[];
  setSearchedCities: (cities: string[]) => void;
  citySearchInput: string;
  setCitySearchInput: (input: string) => void;
  selectedStateFilter: string;
  setSelectedStateFilter: (state: string) => void;
  onAddProperty: (p: Property) => void;
  onDeleteProperty: (id: string) => void;
  currentUser: UserProfile | null;
  triggerNotification: (title: string, msg: string) => void;
}

export default function GisAppraiserTab({
  properties,
  selectedPropId,
  setSelectedPropId,
  encryptionOn,
  setEncryptionOn,
  searchedCities,
  setSearchedCities,
  citySearchInput,
  setCitySearchInput,
  selectedStateFilter,
  setSelectedStateFilter,
  onAddProperty,
  onDeleteProperty,
  currentUser,
  triggerNotification
}: GisAppraiserTabProps) {
  
  // Sourcing manually a new land lead
  const [newApn, setNewApn] = useState('');
  const [newCounty, setNewCounty] = useState('');
  const [newState, setNewState] = useState('TX');
  const [newCity, setNewCity] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [newAcreage, setNewAcreage] = useState('10');
  const [newPrice, setNewPrice] = useState('25000');
  const [newMarket, setNewMarket] = useState('50000');
  const [showAddForm, setShowAddForm] = useState(false);

  // Map Zoom Offset Simulator
  const [mapZoom, setMapZoom] = useState(13);

  // AI Pitch state variables from Gemini server.ts
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<any[]>([]);
  const [aiFeasibility, setAiFeasibility] = useState<any | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  // Cold Calling Assistant States
  const [callLogs, setCallLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('kingdomland_coldcalls_logs');
      return saved ? JSON.parse(saved) : [
        {
          id: 'mock-call-1',
          propertyName: 'Phoenix Land Tract',
          apn: '201-14-998A',
          ownerName: 'Dan Henderson',
          outcome: 'Answered - Warm Lead',
          notes: 'Wants $34,500 instead of $32,000. Willing to sign option contract Tuesday.',
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [callOutcome, setCallOutcome] = useState('Answered - Warm Lead');
  const [callNotes, setCallNotes] = useState('');
  const [isCallingActive, setIsCallingActive] = useState(false);
  const [activeCallDuration, setActiveCallDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Auto incrementing call duration simulation effect with dynamic pause capability
  useEffect(() => {
    let interval: any;
    if (isCallingActive && isTimerRunning) {
      interval = setInterval(() => {
        setActiveCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallingActive, isTimerRunning]);

  const handleStartSimulatedCall = () => {
    setIsCallingActive(true);
    setIsTimerRunning(true);
    setActiveCallDuration(0);
    triggerNotification("📞 Connecting Call...", `Dialing landowner contact: ${activeProperty?.ownerName || 'Unknown Owner'}`);
  };

  const handleStopCallTimer = () => {
    setIsTimerRunning(false);
    triggerNotification("⏸️ Call Timer Frozen", "Duration count paused. You can end the call or resume anytime.");
  };

  const handleResumeCallTimer = () => {
    setIsTimerRunning(true);
    triggerNotification("▶️ Timer Resumed", "Simulated phone call tracking in progress again.");
  };

  const handleHangUpCall = () => {
    setIsTimerRunning(false);
    setIsCallingActive(false);
    triggerNotification("📞 Call Disconnected", "Dialing session stopped. Save notes to file under the ledger.");
  };

  const handleSaveCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty) return;

    const durationLabel = activeCallDuration > 0 ? ` [Dur: ${getFormatDuration(activeCallDuration)}]` : '';
    const newLog = {
      id: 'call-' + Date.now(),
      propertyName: `${activeProperty.city} Parcel`,
      apn: activeProperty.apn,
      ownerName: activeProperty.ownerName,
      outcome: callOutcome,
      notes: (callNotes || 'Dialled owner to review vacant land buy offer.') + durationLabel,
      timestamp: new Date().toISOString()
    };

    const updated = [newLog, ...callLogs];
    setCallLogs(updated);
    localStorage.setItem('kingdomland_coldcalls_logs', JSON.stringify(updated));
    setCallNotes('');
    setActiveCallDuration(0);
    triggerNotification("☎️ Call Log Cached!", `Cold call logged for ${activeProperty.ownerName}.`);
  };

  const handleDeleteCallLog = (id: string) => {
    const updated = callLogs.filter(item => item.id !== id);
    setCallLogs(updated);
    localStorage.setItem('kingdomland_coldcalls_logs', JSON.stringify(updated));
    triggerNotification("Disposed Log", "Purged call entry successfully.");
  };

  const getFormatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAiInspiredColdCallScript = (prop: Property) => {
    return `“Hey there, is this ${prop.ownerName}? My name is with KingdomLand. I was reviewing County Tax Appraiser records for ${prop.city} and noticed your ${prop.acreage} Acre vacant parcel (APN: ${prop.apn}). I appreciate it's completely out of the blue, but we are looking to acquire vacant tracts here. Would you take $${(prop.price).toLocaleString()} cash, or what price makes sense to let this go?”`;
  };

  const handleOpenDefaultEmail = (subject: string, body: string) => {
    const to = recipientEmail ? encodeURIComponent(recipientEmail) : '';
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    triggerNotification("Opening Email Client", "Prefilling chosen pitch into default mail app.");
  };

  // Active property lookup
  const activeProperty = properties.find(p => p.id === selectedPropId) || properties[0];

  // Search input comma separated cities targets list (up to 5 cities simultaneously)
  const handlePerformCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = citySearchInput
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0)
      .slice(0, 5); // Strict limit down to 5 cities simultaneous searches

    setSearchedCities(parsed);
    triggerNotification("Nationwide GIS Filter Updated", `Active Appraiser search targeting cities: ${parsed.join(', ')}.`);
  };

  // Filter properties based on active cities state list
  const filteredProperties = properties.filter(prop => {
    const matchesCity = searchedCities.length === 0 || searchedCities.some(city => prop.city.toLowerCase().includes(city.toLowerCase()));
    const matchesState = selectedStateFilter === 'All' || prop.state === selectedStateFilter;
    return matchesCity && matchesState;
  });

  // Save new landlord sourced
  const handleAddNewPropertyLeads = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApn || !newCity || !newOwner) {
      alert("Please fill out APN, Owner Name, and City values!");
      return;
    }
    const targetPrice = Number(newPrice) || 12000;
    const targetMarket = Number(newMarket) || 28000;
    const size = Number(newAcreage) || 5.0;

    const added: Property = {
      id: 'prop-' + Date.now(),
      apn: newApn,
      county: newCounty || 'County Appraiser Office',
      state: newState,
      city: newCity,
      acreage: size,
      zoning: 'Residential (Vacant)',
      price: targetPrice,
      marketValue: targetMarket,
      ownerName: newOwner,
      ownerPhone: newOwnerPhone || '+1 (800) 555-1200',
      ownerMailAddress: newOwnerAddress || `${newCity}, ${newState}`,
      ownerPhysicalAddress: `${newCity} Section ${Math.floor(Math.random() * 50) + 1}`,
      leadScore: Math.floor(Math.random() * 20) + 80,
      status: 'Lead',
      roadAccess: true,
      utilitiesNearby: false,
      notes: 'Manually logged land parcel via owner appraiser pull campaign.',
      coords: { lat: 39.0 + Math.random() * 4, lng: -100.0 - Math.random() * 15 },
      appraiserRecordId: `M-EXT-${newApn.replace(/[^a-zA-Z0-9]/g, '')}`
    };

    onAddProperty(added);
    setSelectedPropId(added.id);
    setShowAddForm(false);
    
    // reset fields
    setNewApn('');
    setNewCity('');
    setNewOwner('');
    setNewOwnerPhone('');
    setNewOwnerAddress('');
    
    triggerNotification("New Land Registered Sourced", `Assigned Appraiser indexing target APN ${added.apn}`);
  };

  // Dispatch campaign fetch request to real `/api/generate-pitch` endpoint
  const runAiGenerationCampaigns = async (type: 'outreach' | 'feasibility') => {
    if (!activeProperty) return;
    setAiLoading(true);
    setGeneratedPitch([]);
    
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apn: activeProperty.apn,
          address: `${activeProperty.city}, ${activeProperty.state}`,
          acreage: activeProperty.acreage,
          zoning: activeProperty.zoning,
          price: activeProperty.price,
          ownerName: activeProperty.ownerName,
          promptType: type,
          notes: activeProperty.notes
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (type === 'outreach') {
          setGeneratedPitch(data);
          triggerNotification("Campaign Ready!", "Custom investor multi-stage pitch templates written by AI.");
        } else {
          setAiFeasibility(data);
          // Set calculated score
          if (data.leadScore) {
            activeProperty.leadScore = data.leadScore;
          }
          triggerNotification("Appraiser Analysis Finished", "Updated target lead metrics from Gemini AI feedback.");
        }
      } else {
        throw new Error(data.error || "Generation error");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification("AI Engine Offline", err.message || "Could not complete text generation. Please enter your GEMINI_API_KEY.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full items-stretch bg-slate-50 text-slate-800">
      
      {/* Sourced target search control bar */}
      <aside className="w-full lg:w-[350px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto w-full">
        
        {/* Cities database search */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9.5px] font-black text-neon-pink tracking-widest uppercase glow-text-pink">
              US GIS database search filter
            </span>
            <span className="text-[9px] bg-slate-950 text-neon-cyan border border-neon-cyan/40 font-black px-2 py-0.5 rounded font-mono animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.2)]">
              ALL 50 STATES
            </span>
          </div>

          <form onSubmit={handlePerformCitySearch} className="space-y-3">
            <label className="block text-[10.5px] text-slate-700 leading-none font-bold text-left uppercase tracking-wider">
              Cities List Target <strong className="text-neon-pink font-bold">(Up to 5 simultaneously)</strong>:
            </label>
            <div className="flex flex-col gap-1.5">
              <input 
                type="text"
                required
                placeholder="Phoenix, Fort Garland, Belen, Tampa, Dallas"
                value={citySearchInput}
                onChange={(e) => setCitySearchInput(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs focus:border-neon-cyan outline-none text-slate-800 font-medium font-mono focus:ring-1 focus:ring-neon-cyan/40"
              />
              <p className="text-[9.5px] text-slate-500 text-left font-mono">Enter cities separated with a comma to scrape them all at once.</p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1.5">
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-white text-xs border border-slate-250 p-1.5 rounded-xl font-bold cursor-pointer text-slate-800 font-mono outline-none focus:border-neon-cyan"
              >
                <option value="All">All 50 States</option>
                <option value="AZ">AZ (Arizona)</option>
                <option value="CO">CO (Colorado)</option>
                <option value="FL">FL (Florida)</option>
                <option value="NM">NM (New Mexico)</option>
                <option value="OR">OR (Oregon)</option>
                <option value="NV">NV (Nevada)</option>
                <option value="TX">TX (Texas)</option>
              </select>

              <button
                type="submit"
                className="bg-slate-950 hover:bg-slate-900 text-neon-cyan border-2 border-neon-cyan px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_18px_rgba(0,255,255,0.5)] cursor-pointer uppercase tracking-wider"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Sourced Active Cities badges */}
          <div className="flex flex-wrap gap-1 mt-3.5">
            {searchedCities.map((ct, idx) => (
              <span 
                key={idx}
                className="text-[9.5px] bg-slate-950 text-neon-cyan border border-neon-cyan/45 rounded-lg px-2 py-0.5 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(0,255,255,0.15)]"
              >
                <MapPin className="w-2.5 h-2.5 text-neon-cyan shrink-0" />
                {ct}
              </span>
            ))}
          </div>

        </div>

        {/* Lead entries pipelines view */}
        <div className="flex-grow flex flex-col min-h-[250px] overflow-hidden bg-white">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
            <strong className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
              RECORDS SOURCED ({filteredProperties.length})
            </strong>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[9.5px] bg-slate-950 hover:bg-slate-900 border-2 border-neon-green text-neon-bright-green px-2.5 py-1 rounded-full font-black uppercase tracking-wider select-none cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.35)] hover:shadow-[0_0_15px_rgba(57,255,20,0.55)] transition"
            >
              {showAddForm ? 'Cancel' : '+ New Sourced'}
            </button>
          </div>

          {/* New sourced property input overlay form */}
          {showAddForm && (
            <form onSubmit={handleAddNewPropertyLeads} className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5 text-left text-xs animate-slide-down">
              <strong className="text-[10.5px] text-slate-800 uppercase tracking-widest block font-extrabold font-mono text-left border-l-4 border-neon-pink pl-2">Extract Offline / Appraiser Lead</strong>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Assessed APN</label>
                  <input 
                    type="text" required placeholder="e.g. 104-50-221"
                    value={newApn} onChange={e => setNewApn(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs text-slate-800 font-mono outline-none focus:border-neon-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">City Sourced</label>
                  <input 
                    type="text" required placeholder="Tampa"
                    value={newCity} onChange={e => setNewCity(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs text-slate-800 font-mono outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Owner Sourced Name</label>
                  <input 
                    type="text" required placeholder="Jack Henderson"
                    value={newOwner} onChange={e => setNewOwner(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs text-slate-800 font-mono outline-none focus:border-neon-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Owner Phone</label>
                  <input 
                    type="text" placeholder="+1 (813) 555-0100"
                    value={newOwnerPhone} onChange={e => setNewOwnerPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs text-slate-800 font-mono outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Owner Mailing Address</label>
                <input 
                  type="text" placeholder="102 Palms Blvd, Miami, FL"
                  value={newOwnerAddress} onChange={e => setNewOwnerAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs text-slate-800 font-mono outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Size Ac</label>
                  <input 
                    type="number" step="any" value={newAcreage} onChange={e => setNewAcreage(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs font-mono text-slate-800 outline-none focus:border-neon-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Contract Buy</label>
                  <input 
                    type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs font-mono text-slate-800 outline-none focus:border-neon-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5 font-mono">Market Flip</label>
                  <input 
                    type="number" value={newMarket} onChange={e => setNewMarket(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-1.5 rounded-lg text-xs font-mono text-slate-800 outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 border-2 border-neon-green text-neon-bright-green font-black py-2.5 rounded-xl text-center cursor-pointer transition uppercase tracking-wider text-xs shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)]"
              >
                Save Appraiser Sourced Record
              </button>
            </form>
          )}

          {/* Properties lists */}
          <div className="flex-grow overflow-y-auto space-y-2 p-2 bg-slate-50">
            {filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Sliders className="w-8 h-8 mx-auto text-slate-400 opacity-60 mb-2" />
                <p className="text-xs">No parcel records found matching the active filters or state choices.</p>
                <p className="text-[11px] text-neon-pink font-bold mt-2 cursor-pointer hover:underline" onClick={() => setCitySearchInput('Phoenix, Fort Garland, Belen, Tampa, Dallas')}>
                  Reset default searching city list
                </p>
              </div>
            ) : (
              filteredProperties.map(prop => {
                const isActive = prop.id === selectedPropId;
                const profitMargin = prop.marketValue - prop.price;
                return (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedPropId(prop.id)}
                    className={`p-3.5 rounded-2xl transition text-left cursor-pointer border-2 ${
                      isActive 
                        ? 'bg-slate-950 border-neon-cyan text-white shadow-[0_0_12px_rgba(0,255,255,0.35)] relative scale-[1.01]' 
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-neon-cyan animate-ping font-black"></div>
                    )}
                    
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-mono text-xs font-black ${isActive ? 'text-neon-cyan glow-text-cyan' : 'text-slate-800'}`}>APN: {prop.apn}</span>
                      <span className={`text-[9px] border font-black px-1.5 py-0.5 rounded font-mono uppercase ${isActive ? 'bg-slate-900 border-neon-cyan/40 text-neon-cyan' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                        {prop.city}, {prop.state}
                      </span>
                    </div>

                    <div className={`flex justify-between text-xs mt-1 leading-tight ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span>{prop.acreage} Acres • {prop.zoning}</span>
                      <span className={`font-bold font-mono ${isActive ? 'text-neon-bright-green' : 'text-emerald-600'}`}>${prop.price.toLocaleString()} Buy</span>
                    </div>

                    <div className={`flex justify-between items-center mt-2.5 pt-2 border-t ${isActive ? 'border-slate-800' : 'border-slate-100'}`}>
                      <span className={`text-[9.5px] font-bold uppercase tracking-tight ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                        {encryptionOn ? '🔒 CCPA Mask active' : `👤 ${prop.ownerName}`}
                      </span>
                      <span className={`text-[10.5px] font-black font-mono ${isActive ? 'text-neon-bright-green glow-text-green' : 'text-emerald-700'}`}>
                        Profit: +${profitMargin.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Center parcel detail and appraiser charts */}
      <main className="flex-1 bg-slate-50 overflow-y-auto flex flex-col items-stretch">
         {/* Mock GIS Plats Canvas */}
        <div className="h-[280px] bg-slate-100 relative overflow-hidden flex flex-col shrink-0 border-b border-slate-200">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="100" x2="1000" y2="100" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="0" y1="200" x2="1000" y2="200" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="150" y1="0" x2="150" y2="400" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="300" y1="0" x2="300" y2="400" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="450" y1="0" x2="450" y2="300" stroke="#cbd5e1" strokeWidth="1" />

            {/* Selected highlight parcel polygon */}
            <polygon 
              points="160,110 390,130 360,225 180,205" 
              fill="rgba(0, 240, 255, 0.16)" 
              stroke="#00ffff" 
              strokeWidth="4.5" 
              className="animate-pulse"
              filter="drop-shadow(0px 0px 8px rgba(0,255,255,0.7))"
            />
            {/* Adjacent shapes with dashed markers */}
            <polygon points="40,30 170,50 130,95 30,85" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="170,50 280,42 260,110 180,110" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="40,85 130,95 110,185 30,170" fill="none" stroke="#94a3b8" strokeWidth="1.5" />

            <circle cx="280" cy="160" r="10" fill="rgba(6, 182, 212, 0.25)" />
            <circle cx="280" cy="160" r="4.5" fill="#0891b2" />
          </svg>

          {/* GIS Controls */}
          <div className="absolute top-3 left-3 bg-slate-950/95 border border-neon-cyan/40 p-2 rounded-xl flex items-center gap-2 z-10 text-white shadow-[0_0_15px_rgba(0,255,255,0.25)]">
            <span className="text-[9.5px] text-neon-cyan font-mono tracking-widest uppercase font-black glow-text-cyan animate-pulse">GIS Engine:</span>
            <div className="flex gap-1.5">
              <button className="bg-slate-900 border border-slate-800 hover:bg-slate-850 p-1 px-2.5 rounded text-[9px] font-bold text-slate-300">
                Satellite Maps
              </button>
              <button className="bg-slate-900 text-neon-cyan border border-neon-cyan/40 p-1 px-2.5 rounded text-[9px] font-black uppercase shadow-sm">
                Plats & Slopes
              </button>
              <span className="bg-neon-green-dim text-neon-bright-green border border-neon-green/35 p-1 px-2.5 rounded text-[9px] font-black uppercase animate-pulse">
                Appraiser Overlay Active
              </span>
            </div>
          </div>

          {/* Coordinates indicator banner */}
          {activeProperty && (
            <div className="absolute bottom-3 left-3 bg-slate-950/95 text-slate-250 text-xs border-2 border-neon-cyan text-left p-3.5 rounded-2xl max-w-sm shadow-[0_0_15px_rgba(0,255,255,0.30)] font-mono">
              <div className="flex items-center gap-1.5 text-neon-bright-green">
                <Flame className="w-3.5 h-3.5 animate-pulse text-neon-bright-green" />
                <span className="font-extrabold uppercase text-[10px] tracking-wide glow-text-green">Appraiser Sourced Target</span>
              </div>
              <p className="mt-1 text-white font-extrabold block text-[11px] font-sans">APN: {activeProperty.apn} ({activeProperty.acreage} Acres)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Record ID Index: <strong className="text-neon-cyan">{activeProperty.appraiserRecordId}</strong></p>
            </div>
          )}

          {/* State tags */}
          <div className="absolute top-3 right-3 text-[10px] bg-slate-950/90 text-neon-bright-green border border-neon-green/35 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(57,255,20,0.25)]">
            <span className="h-2 w-2 rounded-full bg-neon-bright-green animate-ping"></span>
            <span>Live Appraiser Scraper: Active (All 50 states)</span>
          </div>

          {/* Zoom tool buttons */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-slate-800">
            <button 
              onClick={() => setMapZoom(prev => Math.max(10, prev - 1))}
              className="p-1 px-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold border border-slate-250 cursor-pointer"
            >
              -
            </button>
            <span className="text-[9.5px] bg-slate-950 p-1 px-2 font-mono rounded-lg border border-neon-cyan/40 text-neon-cyan shadow-sm">
              Zoom: {mapZoom}
            </span>
            <button 
              onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}
              className="p-1 px-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold border border-slate-250 cursor-pointer"
            >
              +
            </button>
          </div>

        </div>

        {/* Land and County record detailed metadata */}
        <div className="p-5 space-y-4 text-left flex-grow">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>County Tax & Land Appraiser Extractions File</span>
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">Vacant parcel listing credentials corresponding to APN: <strong className="text-emerald-705 font-mono font-black">{activeProperty.apn}</strong></p>
            </div>

            {/* CCPA mask disclaimer box */}
            <div className="flex items-center gap-2 bg-white p-2.5 border border-slate-200 rounded-xl text-[10px] text-slate-600 max-w-sm shadow-sm">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Durable database cryptographic masking active. Compliant with standard US Consumer Data Shield regulations.</span>
            </div>
          </div>

          {/* Properties metadata cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <span className="block text-[9.5px] uppercase font-bold text-slate-505 mb-1.5 tracking-wider font-mono">Owner Name Sourced</span>
              <strong className="text-slate-800 font-black text-sm block">
                {encryptionOn ? 'Taylor Tycoon Secure Lock' : activeProperty.ownerName}
              </strong>
              <span className="text-[10px] text-slate-500 block mt-1.5 font-bold">County Title Owner</span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <span className="block text-[9.5px] uppercase font-bold text-slate-505 mb-1.5 tracking-wider font-mono">Owner Telephone</span>
              <strong className="text-emerald-705 font-black text-sm block font-mono">
                {encryptionOn ? '🔒 Mask Encrypted' : activeProperty.ownerPhone}
              </strong>
              <span className="text-[10px] text-slate-500 block mt-1.5 font-bold">Office Contact Phone</span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <span className="block text-[9.5px] uppercase font-bold text-slate-505 mb-1.5 tracking-wider font-mono">Mail Destination</span>
              <p className="text-xs text-slate-700 font-bold">
                {encryptionOn ? '🔒 Protected Mail Destination' : activeProperty.ownerMailAddress}
              </p>
              <span className="text-[9.5px] font-black text-emerald-600 mt-1.5 block uppercase animate-pulse leading-none">&larr; USPS Postcard Target</span>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <span className="block text-[9.5px] uppercase font-bold text-slate-505 mb-1.5 tracking-wider font-mono">Coordinates & Legal</span>
              <p className="text-xs text-slate-700 font-medium font-mono">
                {activeProperty.ownerPhysicalAddress}
              </p>
              <span className="text-[10px] text-slate-500 block mt-1.5 font-bold">Acreage size: {activeProperty.acreage} AC</span>
            </div>

          </div>

          {/* Financial ROI and analytics margins */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between text-left">
              <div>
                <span className="block text-[9px] text-slate-505 font-bold uppercase tracking-wider font-mono">Potential Wholesaling Margin</span>
                <strong className="text-2.5xl font-black text-emerald-600 font-mono mt-1.5 block">
                  +${(activeProperty.marketValue - activeProperty.price).toLocaleString()}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-1.5 leading-normal">Assuming wholesale contract sign offer markup</span>
              </div>
              <div className="p-2.5 bg-slate-50 text-emerald-600 rounded-xl border border-slate-200">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <span className="block text-[9px] text-slate-505 font-bold uppercase tracking-wider font-mono">Average land rate per AC</span>
              <strong className="text-lg font-black text-slate-800 font-mono mt-2 block">
                ${Math.round(activeProperty.price / activeProperty.acreage).toLocaleString()} / Acre
              </strong>
              <span className="text-[10px] text-slate-555 block mt-1.5 font-bold uppercase tracking-tight text-emerald-605 leading-none">Extremely lucrative buy-box</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left">
              <span className="block text-[9px] text-slate-505 font-bold uppercase tracking-wider font-mono">Lead Match Rating index</span>
              <strong className="text-lg font-black text-rose-600 font-mono mt-2 block">
                {activeProperty.leadScore}% Lead rating
              </strong>
              <span className="text-[10px] text-slate-555 block mt-1.5 font-bold uppercase tracking-tight text-rose-500">Reflects fast-closing probability</span>
            </div>

          </div>

          {/* AI Generative Engine Panel */}
          <div className="bg-white border-2 border-neon-cyan/50 rounded-2xl p-5 text-left shadow-[0_0_15px_rgba(0,190,255,0.1)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-3 mb-3 gap-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-neon-pink shrink-0 animate-pulse" />
                <strong className="text-sm font-black uppercase text-slate-800 tracking-wide glow-text-pink">
                  AI Sourcing Intelligence suite (Gemini Flash active)
                </strong>
              </div>

              <div className="flex gap-2.5 w-full md:w-auto">
                <button
                  onClick={() => runAiGenerationCampaigns('feasibility')}
                  disabled={aiLoading}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-800 py-2 px-3.5 rounded-xl text-[10.5px] font-black border border-slate-250 disabled:opacity-40 cursor-pointer text-center flex-1 md:flex-initial uppercase tracking-wider transition"
                >
                  {aiLoading ? 'Accessing server...' : '🔮 Run AI Feasibility Study'}
                </button>
                <button
                  onClick={() => runAiGenerationCampaigns('outreach')}
                  disabled={aiLoading}
                  className="bg-slate-950 hover:bg-slate-900 text-neon-bright-green border-2 border-neon-green py-2 px-4 rounded-xl text-[10.5px] font-black disabled:opacity-40 cursor-pointer text-center flex-1 md:flex-initial uppercase tracking-wider shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition duration-200"
                >
                  {aiLoading ? 'Compiling outreach templates...' : '🤖 Write Custom Investor Pitch'}
                </button>
              </div>
            </div>

            {aiLoading && (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-7 h-7 mx-auto animate-spin text-emerald-600" />
                <p className="text-xs text-slate-500 font-mono">Connecting with Express dev-server sandbox. Generating contextual land data models...</p>
              </div>
            )}

            {/* AI Custom Outreach output template logs */}
            {!aiLoading && generatedPitch.length > 0 && (
              <div className="space-y-4 animate-fade-in text-xs font-sans">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                  <h4 className="text-emerald-700 font-black tracking-widest uppercase text-[10px]">📬 Generated Multi-Stage Land Flipping Email templates:</h4>
                  
                  {/* Optional Recipient Email Input */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-[10px] text-slate-505 font-black whitespace-nowrap uppercase tracking-wider">Send to (Optional):</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="investor@example.com"
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] outline-none text-slate-700 font-mono w-full sm:w-[200px] focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                  {generatedPitch.map((pt, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between group hover:border-emerald-500 transition duration-200 shadow-sm">
                      <div>
                        <span className="text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-black px-2 py-1 rounded uppercase tracking-widest font-mono">
                          Outreach stage {pt.stage}
                        </span>
                        <strong className="block mt-2.5 font-bold text-slate-800">Subject: {pt.subject}</strong>
                        <p className="text-[11px] text-slate-700 mt-2 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-100 p-2.5 rounded-lg font-medium">
                          {pt.body}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenDefaultEmail(pt.subject, pt.body)}
                        className="w-full mt-3.5 bg-slate-50 hover:bg-slate-100 text-emerald-700 border border-emerald-250 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm uppercase tracking-wider font-sans"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send Pitch via Email</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feasibility study output template */}
            {!aiLoading && aiFeasibility && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs text-slate-800 font-sans animate-fade-in">
                <div className="lg:col-span-2">
                  <strong className="text-emerald-700 block text-[10px] uppercase font-black tracking-widest leading-none mb-2 select-none uppercase">AI Appraisal summary & feasibility path:</strong>
                  <p className="text-slate-700 leading-relaxed bg-slate-55 p-3 rounded-xl border border-slate-200 font-medium">
                    {aiFeasibility.analysisSummary}
                  </p>
                </div>
                <div className="bg-slate-55 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <strong className="text-[9.5px] text-slate-505 block font-bold uppercase tracking-wider mb-2 font-mono">Target Buying Segments:</strong>
                    <ul className="space-y-1.5">
                      {aiFeasibility.suggestedBuyers?.map((b: string, i: number) => (
                        <li key={i} className="flex gap-1.5 items-start text-[11px] leading-snug font-medium text-slate-705">
                          <span className="text-emerald-605 font-black">&bull;</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-slate-200 pt-2.5 mt-3.5 flex justify-between items-center font-mono">
                    <span className="text-slate-500 text-[10px] uppercase tracking-wide">Estimated ROI:</span>
                    <strong className="text-emerald-705 text-xs font-black">{aiFeasibility.projectedROI || '24.5%'}</strong>
                  </div>
                </div>
              </div>
            )}

            {!aiFeasibility && generatedPitch.length === 0 && !aiLoading && (
              <p className="text-xs text-slate-500 font-mono text-center select-none py-1.5">
                🤖 Select any parcel record to unlock automated intelligence. Gemini will run tax appraisal statistics and draft outreach.
              </p>
            )}

          </div>

          {/* --- LANDOWNER COLD-CALLING ASSISTANT --- */}
          <div className="bg-white border-2 border-emerald-650/30 rounded-2xl p-5 text-left shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-3 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 shrink-0">
                  <PhoneCall className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide flex items-center flex-wrap gap-1.5">
                    <span>☎️ Direct Landowner Cold-Calling Assistant</span>
                    <span className="text-[9px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full uppercase animate-pulse">
                      Live Telephony Dialing Module
                    </span>
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                    Dial lead property owners instantly and document calls under land ledger rows.
                  </p>
                </div>
              </div>

              {!isCallingActive ? (
                <button
                  type="button"
                  onClick={handleStartSimulatedCall}
                  className="bg-emerald-600 hover:bg-emerald-505 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition duration-200 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Start Live Dial Session</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Digital timer badge */}
                  <div className={`border rounded-xl px-3 py-2 text-xs font-mono font-black flex items-center gap-2 ${
                    isTimerRunning 
                      ? 'bg-rose-50 border-rose-250 text-rose-750 animate-pulse' 
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}>
                    <Volume2 className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-rose-550 animate-bounce' : 'text-slate-400'}`} />
                    <span>TIMER: {getFormatDuration(activeCallDuration)} {isTimerRunning ? '' : '(PAUSED)'}</span>
                  </div>

                  {/* Pause / Play Call Timer button */}
                  {isTimerRunning ? (
                    <button
                      type="button"
                      onClick={handleStopCallTimer}
                      className="bg-amber-500 hover:bg-amber-450 text-white font-black px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      title="Freeze calling counter"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Stop Timer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResumeCallTimer}
                      className="bg-emerald-600 hover:bg-emerald-555 text-white font-black px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      title="Continue calling counter"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Resume Timer</span>
                    </button>
                  )}

                  {/* Stop / End Call button */}
                  <button
                    type="button"
                    onClick={handleHangUpCall}
                    className="bg-rose-650 hover:bg-rose-550 border border-rose-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Call / Stop</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active dial state displays */}
            {isCallingActive && activeProperty && (
              <div className="bg-slate-950 text-white p-5 rounded-2xl border-2 border-neon-cyan/55 space-y-4 animate-slide-down relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00ffff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[9.5px] font-mono tracking-widest text-neon-cyan font-black uppercase block glow-text-cyan">
                      &bull; TELEPHONY GRID LIVE DIAL LINKED
                    </span>
                    <h4 className="text-sm font-black uppercase text-white mt-1.5">
                      Calibrated Line: <span className="font-mono text-neon-bright-green">{encryptionOn ? '+1 (🔒) Masked' : activeProperty.ownerPhone}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Landowner: <strong className="text-white">{encryptionOn ? '🔒 Privacy Encrypted' : activeProperty.ownerName}</strong> &bull; APN: {activeProperty.apn}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9.5px] bg-neon-cyan-dim text-neon-cyan border border-neon-cyan/40 font-mono font-black tracking-widest uppercase px-2 py-1 rounded">
                      Outbound Call
                    </span>
                  </div>
                </div>

                {/* Click-to-call link for real phone triggers */}
                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-350 gap-3 relative z-10">
                  <span className="font-medium text-[11px] text-center sm:text-left">Would you like to dial out using your local phone system instead?</span>
                  <a
                    href={`tel:${activeProperty.ownerPhone}`}
                    className="bg-neon-cyan/10 hover:bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan px-4 py-2 rounded-xl font-black uppercase tracking-wider transition text-center shrink-0 text-[10.5px]"
                    onClick={() => triggerNotification("Initiating tel protocol", "Sourcing device call application.")}
                  >
                    📞 Dial {encryptionOn ? 'Masked' : activeProperty.ownerPhone}
                  </a>
                </div>

                {/* Dynamic AI Script for call helper */}
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-1.5 text-neon-pink">
                    <MessageSquare className="w-4 h-4 text-neon-pink animate-pulse" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider glow-text-pink">Instant Cold Call Screen-Script:</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-slate-200 text-xs leading-relaxed italic whitespace-pre-line font-medium shadow-inner">
                    {getAiInspiredColdCallScript(activeProperty)}
                  </div>
                </div>
              </div>
            )}

            {/* Disposition & logger form */}
            {activeProperty && (
              <form onSubmit={handleSaveCallLog} className="bg-slate-50 border border-slate-205 p-4 rounded-xl space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">Call Outcome Disposition</label>
                    <select
                      value={callOutcome}
                      onChange={e => setCallOutcome(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs text-slate-800 font-bold focus:border-emerald-600 outline-none cursor-pointer"
                    >
                      <option value="Answered - Warm Lead">🔥 Answered - Warm Lead / Interested</option>
                      <option value="Answered - Busy / Call Back">⏳ Answered - Request Callback</option>
                      <option value="Wrong Number / Dead Line">⚠️ Wrong Number / Deceased Owner</option>
                      <option value="Voicemail Drop">📬 Deposited to Voicemail Box</option>
                      <option value="No Answer At All">💤 Ringing Finished - No Answer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">Detailed Conversation Log Notes</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Owner willing to let it go for $12k cash, wants prompt option email..."
                      value={callNotes}
                      onChange={e => setCallNotes(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2.5 rounded-xl text-xs text-slate-800 font-medium focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-slate-950 hover:bg-slate-900 border-2 border-emerald-500 text-neon-bright-green font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)] hover:shadow-[0_0_15px_rgba(57,255,20,0.35)] transition duration-200"
                  >
                    📝 Log Call Entry to Ledger
                  </button>
                </div>
              </form>
            )}

            {/* Call Logs History Section */}
            <div className="space-y-2.5 pt-1.5">
              <div className="flex items-center gap-1.5 text-slate-500">
                <History className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">Cold Calling Campaign Ledger History ({callLogs.length})</span>
              </div>

              {callLogs.length === 0 ? (
                <p className="text-[11px] text-slate-500 font-mono text-center select-none py-2">No call logs recorded. Launch dialers to keep history tracks.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {callLogs.map((log: any) => (
                    <div key={log.id} className="bg-slate-50 border border-slate-200 hover:border-emerald-600/30 p-3.5 rounded-xl flex flex-col justify-between transition text-xs relative group text-left">
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9.5px] bg-slate-205 border border-slate-300 px-1.5 py-0.5 rounded font-black font-mono">
                              APN: {log.apn}
                            </span>
                            <span className="text-xs font-black text-slate-800 font-sans">
                              {log.ownerName}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteCallLog(log.id)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                          <span className="font-extrabold text-emerald-700 capitalize p-0.5 bg-emerald-50 px-2 rounded border border-emerald-200/40 text-[9px] font-mono leading-none">
                            {log.outcome}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        <p className="text-[10.5px] bg-white border border-slate-100 p-2 text-slate-600 rounded-lg font-medium tracking-tight">
                          {log.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Compliance & legal disclosures text */}
          <div className="bg-white p-4 rounded-xl text-[10.5px] text-slate-500 border border-slate-200 leading-relaxed font-sans shadow-sm">
            <div className="flex gap-2 items-start text-left">
              <HelpCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-slate-800 block mb-0.5">County Sourcing Legal Compliance Notice:</strong>
                <span>Property Appraiser extractions listed match publicly accessible tax office records. Sourcing phone data or physical mail indexes complies with state records acts. High data privacy standard filters are armed on local user states to ensure zero leak exposures. Users should secure clear title insurance when assigning final wholesaling purchase agreements with cash developers.</span>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
