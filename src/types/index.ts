export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
}

export interface Slip {
  id: string;
  date: string;
  totalOdds: number;
  bookingCode: string;
  status: 'hot' | 'won' | 'pending' | 'lost';
  games: Game[];
  isVip: boolean;
  stakeLink?: string;
  /** Custom price label shown on VIP unlock button, e.g. "GH₵10" */
  price?: string;
  /** Payment / unlock redirect URL for this VIP slip (e.g. Selar / Paystack link) */
  unlockLink?: string;
  /** Unix timestamp (ms) of when status was last set to 'won' or 'lost' */
  statusUpdatedAt?: number;
}
