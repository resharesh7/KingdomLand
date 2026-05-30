export interface Property {
  id: string;
  apn: string;
  county: string;
  state: string;
  city: string;
  acreage: number;
  zoning: string;
  price: number; // Contract buy price or owner offer ask
  marketValue: number; // Realized vacant land resale value
  ownerName: string;
  ownerPhone: string;
  ownerMailAddress: string;
  ownerPhysicalAddress: string;
  leadScore: number;
  status: 'Lead' | 'Approved' | 'Sold' | 'Not Interested';
  roadAccess: boolean;
  utilitiesNearby: boolean;
  notes: string;
  coords: { lat: number; lng: number };
  appraiserRecordId: string;
}

export interface UserProfile {
  name: string;
  email: string;
  plan: 'Starter' | 'Pro' | 'Pro Plus';
  isAnnual: boolean;
  marketingCredits: number;
  autoReloadEnabled: boolean;
  trialDaysLeft: number;
  isTrial: boolean;
  createdAt: string;
  isActive?: boolean;
  cardInfo?: { number: string; expiry: string; cvc: string; name: string };
  creditsBought?: number;
}

export interface PostcardOrder {
  id: string;
  propertyApn: string;
  recipient: string;
  recipientMail: string;
  size: '4x6' | '6x9' | '6x11';
  cost: number;
  timestamp: string;
  templateName: string;
}
