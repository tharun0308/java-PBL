import { Category, Priority, CATEGORIES } from './constants';
import { Complaint } from './types';

interface AiClassificationResult {
  category: Category;
  priority: Priority;
  confidence: number;
  rationale: string;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Electrical: [
    'spark', 'shock', 'short circuit', 'wire', 'fan', 'light', 'tube light', 'bulb',
    'switch', 'socket', 'plug', 'mcb', 'power', 'fuse', 'blackout', 'electricity',
    'voltage', 'surge', 'generator', 'ac unit', 'air conditioner',
  ],
  'Water Supply': [
    'leak', 'pipe', 'tap', 'faucet', 'water', 'cooler', 'filter', 'overflow',
    'sewage', 'drain', 'choked', 'flush', 'washroom water', 'tank', 'plumbing',
  ],
  Cleanliness: [
    'dust', 'garbage', 'trash', 'waste', 'bin', 'smell', 'odor', 'stain',
    'dirty', 'mop', 'sweep', 'washroom dirty', 'hygiene', 'cockroach', 'pest',
  ],
  'Hostel Maintenance': [
    'bed', 'cupboard', 'almirah', 'window', 'door', 'lock', 'key', 'latch',
    'hostel room', 'balcony', 'curtain', 'mattress', 'room ceiling', 'wardrobe',
  ],
  'Internet/IT': [
    'wifi', 'wi-fi', 'internet', 'network', 'lan', 'ethernet', 'router', 'switch',
    'ap-', 'access point', 'port', 'dns', 'signal', 'speed', 'portal', 'server',
  ],
  'Laboratory Equipment': [
    'oscilloscope', 'multimeter', 'microscope', 'bunsen', 'sensor', 'workbench',
    'instrument', 'apparatus', 'fume hood', 'chemical', 'pipette', 'centrifuge',
  ],
  Infrastructure: [
    'ramp', 'pothole', 'road', 'pathway', 'tile', 'plaster', 'crack', 'staircase',
    'handrail', 'roof leak', 'wall paint', 'bench', 'auditorium seat', 'pillar',
  ],
  Other: [
    'vending machine', 'canteen', 'lost', 'noise', 'parking', 'notice board',
  ],
};

const HIGH_PRIORITY_KEYWORDS = [
  'spark', 'smoke', 'fire', 'shock', 'severe', 'danger', 'hazard', 'emergency',
  'overflowing', 'urgent', 'continuous', 'burst', 'collapsed', 'exposed wire',
];

const LOW_PRIORITY_KEYWORDS = [
  'minor', 'request', 'slow', 'dust', 'cosmetic', 'paint', 'suggestion',
];

export function aiClassifyComplaint(description: string, location: string = ''): AiClassificationResult {
  const text = `${description} ${location}`.toLowerCase();

  const scores: Record<Category, number> = {
    Electrical: 0,
    'Water Supply': 0,
    Cleanliness: 0,
    'Hostel Maintenance': 0,
    'Internet/IT': 0,
    'Laboratory Equipment': 0,
    Infrastructure: 0,
    Other: 0,
  };

  for (const cat of CATEGORIES) {
    for (const kw of CATEGORY_KEYWORDS[cat]) {
      if (text.includes(kw)) {
        scores[cat] += 2;
      }
    }
  }

  let bestCat: Category = 'Other';
  let maxScore = 0;
  for (const cat of CATEGORIES) {
    if (scores[cat] > maxScore) {
      maxScore = scores[cat];
      bestCat = cat;
    }
  }

  // Priority detection
  let priority: Priority = 'Medium';
  if (HIGH_PRIORITY_KEYWORDS.some((kw) => text.includes(kw))) {
    priority = 'High';
  } else if (LOW_PRIORITY_KEYWORDS.some((kw) => text.includes(kw)) && maxScore < 4) {
    priority = 'Low';
  }

  const confidence = maxScore > 0 ? Math.min(0.95, 0.6 + maxScore * 0.08) : 0.5;

  let rationale = `Matched facility patterns for ${bestCat}.`;
  if (priority === 'High') {
    rationale += ' High urgency flagged due to critical risk keywords.';
  }

  return {
    category: bestCat,
    priority,
    confidence: Number(confidence.toFixed(2)),
    rationale,
  };
}

export function findPotentialDuplicates(
  activeComplaints: Complaint[],
  category: Category,
  location: string
): Complaint[] {
  if (!location || location.trim().length < 3) return [];

  const locWords = location
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  return activeComplaints.filter((c) => {
    // Only check active (non-resolved) complaints
    if (c.status === 'Resolved' || c.status === 'Rejected') return false;
    if (c.category !== category) return false;

    const existingLoc = c.location.toLowerCase();
    // Check if substantial word matches in location
    const matchingWords = locWords.filter((w) => existingLoc.includes(w));
    return matchingWords.length >= 2 || (locWords.length === 1 && matchingWords.length === 1);
  });
}
