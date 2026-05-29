import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  TrendingUp,
  X 
} from 'lucide-react';
import { Property, UserProfile } from '../types';

interface AccountingTabProps {
  properties: Property[];
  onAddProperty: (p: Property) => void;
  onUpdateStatusInSpreadsheet: (propId: string, status: 'Lead' | 'Approved' | 'Sold' | 'Not Interested') => void;
  onDeleteProperty: (id: string) => void;
  encryptionOn: boolean;
  totalPostcardSpent: number;
  triggerNotification: (title: string, msg: string) => void;
}

export default function AccountingTab({
  properties,
  onAddProperty,
  onUpdateStatusInSpreadsheet,
  onDeleteProperty,
  encryptionOn,
  totalPostcardSpent,
  triggerNotification
}: AccountingTabProps) {
  
  // Spreadsheet adding state
  const [accApn, setAccApn] = useState('');
  const [accOwner, setAccOwner] = useState('');
  const [accPrice, setAccPrice] = useState('');
  const [accResale, setAccResale] = useState('');
  const [accStatus, setAccStatus] = useState<'Approved' | 'Sold' | 'Not Interested'>('Approved');

  // Accounting quick totals math
  const approvedDeals = properties.filter(p => p.status === 'Approved');
  const soldDeals = properties.filter(p => p.status === 'Sold');
  const passedDeals = properties.filter(p => p.status === 'Not Interested');

  const totalAcquisitionCosts = approvedDeals.reduce((sum, p) => sum + p.price, 0);
  const totalPotentialResaleValue = approvedDeals.reduce((sum, p) => sum + p.marketValue, 0);
  
  // Realized profit is from SOLD properties
  const totalRealizedWholesaleProfits = soldDeals.reduce((sum, p) => sum + (p.marketValue - p.price), 0);
  
  const netAccountingCommissionProfit = totalRealizedWholesaleProfits - totalPostcardSpent;

  // Manual record insert action
  const handleManualAddAccountDeals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accApn || !accOwner) {
      triggerNotification("Error Sourcing Deal", "Assessed APN and landowner name are required.");
      return;
    }
    const purchaseVal = Number(accPrice) || 15000;
    const resaleVal = Number(accResale) || 30000;

    const added: Property = {
      id: 'prop-' + Date.now(),
      apn: accApn,
      county: 'Custom Sourced Ledger',
      state: 'US',
      city: 'Manual Ledger',
      acreage: 10.0,
      zoning: 'Open Land',
      price: purchaseVal,
      marketValue: resaleVal,
      ownerName: accOwner,
      ownerPhone: '+1 (555) 555-4089',
      ownerMailAddress: 'N/A',
      ownerPhysicalAddress: 'N/A',
      leadScore: 90,
      status: accStatus,
      roadAccess: true,
      utilitiesNearby: true,
      notes: 'Manually logged ledger parcel for accounting ROI audits.',
      coords: { lat: 40.0, lng: -105.0 },
      appraiserRecordId: 'M-MAN-' + Math.floor(Math.random() * 99999)
    };

    onAddProperty(added);
    setAccApn('');
    setAccOwner('');
    setAccPrice('');
    setAccResale('');

    triggerNotification("Accounting Deal Sourced Record Saved", `Stored APN ${added.apn} mapping status context.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left w-full bg-slate-50 text-slate-800">
      
      {/* Dynamic accounting dashboard summary metric grids */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
        
        <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-2xl text-left hover:border-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.25)] duration-200">
          <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider font-mono">Realized Wholesaling Profit (SOLD)</span>
          <strong className="text-2.5xl font-black font-mono text-emerald-600 mt-1 block">
            ${totalRealizedWholesaleProfits.toLocaleString()}
          </strong>
          <span className="text-[10px] text-slate-500 mt-1 block font-medium">Accumulated from {soldDeals.length} wholesaled targets</span>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-2xl text-left hover:border-neon-pink hover:shadow-[0_0_15px_rgba(255,0,127,0.2)] duration-200">
          <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider font-mono">Postcard marketing spent</span>
          <strong className="text-2.5xl font-black font-mono text-rose-600 mt-1 block">
            ${totalPostcardSpent.toFixed(2)}
          </strong>
          <span className="text-[10px] text-slate-500 mt-1 block font-medium">Dispatched USPS paper collateral costs</span>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-2xl text-left hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.25)] duration-200">
          <span className="block text-[9.5px] text-slate-500 font-bold uppercase tracking-wider font-mono">Net program balance (Profit - Marketing)</span>
          <strong className="text-2.5xl font-black font-mono text-cyan-705 mt-1 block">
            ${netAccountingCommissionProfit.toLocaleString()}
          </strong>
          <span className={`text-[10px] font-black block mt-1 uppercase tracking-wider ${netAccountingCommissionProfit >= 0 ? 'text-neon-cyan glow-text-cyan bg-slate-950 px-2 py-0.5 rounded border border-neon-cyan/40 w-fit' : 'text-rose-500'}`}>
            {netAccountingCommissionProfit >= 0 ? '✓ Positive multiplier active' : '! Warning debit offset limit'}
          </span>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-2xl text-left hover:border-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] duration-200">
          <span className="block text-[9.5px] text-slate-505 font-bold uppercase tracking-wider font-mono">Under-Contract option pipeline</span>
          <strong className="text-2.5xl font-black font-mono text-emerald-600 mt-1 block">
            {approvedDeals.length} Active Deals
          </strong>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono font-bold">
            Unrealized margin: ${(totalPotentialResaleValue - totalAcquisitionCosts).toLocaleString()}
          </span>
        </div>

      </section>

      {/* Quick transactional manual addition drawer */}
      <section className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm text-left">
        <strong className="text-xs uppercase tracking-widest text-slate-800 block mb-3 font-black border-l-4 border-neon-pink pl-2">
          ➕ Quick Sourced Ledger Entry: Log Sourced Contract directly to Spreadsheet
        </strong>
        
        <form onSubmit={handleManualAddAccountDeals} className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider">Assessed Parcel APN</label>
            <input 
              type="text" required placeholder="e.g. 505-12-094"
              value={accApn} onChange={e => setAccApn(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-mono font-bold outline-none focus:border-neon-cyan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider">Landowner Sourced Name</label>
            <input 
              type="text" required placeholder="Owner Sourced Name"
              value={accOwner} onChange={e => setAccOwner(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-medium outline-none focus:border-neon-cyan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider">Purchase Price</label>
            <input 
              type="number" required placeholder="e.g. 15000"
              value={accPrice} onChange={e => setAccPrice(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-850 font-mono outline-none focus:border-neon-cyan"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-wider">Assignment Resale markup</label>
            <input 
              type="number" required placeholder="e.g. 35000"
              value={accResale} onChange={e => setAccResale(e.target.value)}
              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-855 font-mono outline-none focus:border-neon-cyan"
            />
          </div>
          <div className="space-y-1 flex flex-col justify-end">
            <div className="flex gap-2">
              <select
                value={accStatus}
                onChange={e => setAccStatus(e.target.value as any)}
                className="bg-white text-xs border border-slate-200 p-2 rounded-xl text-slate-700 font-black cursor-pointer flex-1 outline-none focus:border-neon-cyan"
              >
                <option value="Approved">Approved (Under option)</option>
                <option value="Sold">Sold (Wholesaled)</option>
                <option value="Not Interested">Not Interested (Skip)</option>
              </select>

              <button
                type="submit"
                className="bg-slate-950 hover:bg-slate-900 border-2 border-neon-green text-neon-bright-green px-4 py-2 rounded-xl font-black shadow transition shrink-0 cursor-pointer text-center uppercase tracking-wide"
              >
                Add Row
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Main Ledger spreadsheet table */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-slate-800">
            <FileSpreadsheet className="text-neon-pink w-5 h-5" />
            <strong className="text-xs uppercase tracking-widest font-black text-neon-pink glow-text-pink">
              Live Wholesaling Deal ledger spreadsheet
            </strong>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
            <span>Updates net commission margins & ROI indicators instantly upon status change overrides</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            <thead>
              <tr className="bg-slate-50 text-slate-705 font-black border-b border-slate-200 uppercase text-[9px] tracking-widest">
                <th className="p-3">APN / Record Reference</th>
                <th className="p-3">Sourced Landowner</th>
                <th className="p-3">Location Attributes</th>
                <th className="p-3">Acreage size</th>
                <th className="p-3">Contract Buy Rate</th>
                <th className="p-3">Assignment Resale target</th>
                <th className="p-3 text-emerald-700 font-black">Wholesale margin spread</th>
                <th className="p-3 text-center">Status Action</th>
                <th className="p-3 text-center">Operations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-650 font-medium animate-fade-in bg-white">
              {properties.map(p => {
                const calculatedMargin = p.marketValue - p.price;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                    <td className="p-3">
                      <span className="font-mono font-black text-slate-800 block text-xs">{p.apn}</span>
                      <span className="text-[9.5px] text-slate-450 block font-mono">{p.appraiserRecordId}</span>
                    </td>
                    <td className="p-3 text-slate-800 font-bold">
                      {encryptionOn ? '🔒 Mashed Lock Protected' : p.ownerName}
                    </td>
                    <td className="p-3 text-slate-600">
                      {p.city}, {p.state}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {p.acreage} AC
                    </td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">
                      ${p.price.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      ${p.marketValue.toLocaleString()}
                    </td>
                    <td className={`p-3 font-mono font-black text-sm ${calculatedMargin > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                      +${calculatedMargin.toLocaleString()}
                    </td>
                    
                    <td className="p-3 text-center">
                      <select
                        value={p.status}
                        onChange={e => onUpdateStatusInSpreadsheet(p.id, e.target.value as any)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl outline-none cursor-pointer border ${
                          p.status === 'Sold' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : p.status === 'Approved' 
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-100' 
                            : p.status === 'Not Interested'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        <option value="Lead">Lead sourced</option>
                        <option value="Approved">Approved (Under contract)</option>
                        <option value="Sold">Sold (Wholesaled option)</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </td>

                    <td className="p-3 text-center animate-fade-in">
                      <button
                        onClick={() => onDeleteProperty(p.id)}
                        className="text-rose-600 hover:text-rose-500 p-2 rounded-xl transition cursor-pointer"
                        title="Delete sourced record"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Legend status indicators */}
        <div className="bg-slate-50 p-4 text-[10px] text-slate-500 font-mono flex flex-wrap justify-between items-center border-t border-slate-200 gap-2 font-medium">
          <span className="uppercase tracking-wider">Spreadsheet ledger summary legend:</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span><strong>{properties.filter(p=>p.status==='Sold').length}</strong> Sold (Spread Collected)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-505"></span>
              <span><strong>{properties.filter(p=>p.status==='Approved').length}</strong> Under contract active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span><strong>{properties.filter(p=>p.status==='Not Interested').length}</strong> Not interested</span>
            </span>
          </div>
        </div>

      </section>

    </div>
  );
}
export { AccountingTab };
