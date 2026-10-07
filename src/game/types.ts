export type Stage = 'baby' | 'teen' | 'adult';
export type AdultVariant = 'fluffy' | 'normal' | 'scruffy';
export type Mood = 'happy' | 'content' | 'sad' | 'sick' | 'sleeping';

export type AdventureId =
  | 'garden-stroll'
  | 'beach-day'
  | 'bakery-shift'
  | 'office-job'
  | 'wizard-school'
  | 'pirate-voyage'
  | 'epic-quest'
  | 'space-mission';

export type OutfitId =
  | 'flower-crown'
  | 'sun-hat'
  | 'chef-hat'
  | 'suit'
  | 'wizard-hat'
  | 'pirate-hat'
  | 'hobbit-cloak'
  | 'astronaut-helmet';

export interface Needs {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
}

export interface Adventure {
  id: AdventureId;
  startedAt: number;
  endsAt: number;
}

export interface Bunny {
  name: string;
  adoptedAt: number;
  lastUpdatedAt: number;
  needs: Needs;
  asleep: boolean;
  sick: boolean;
  depressed: boolean;
  zeroMs: { hunger: number; cleanliness: number; happiness: number };
  care: { weightedSum: number; durationMs: number };
  adultVariant: AdultVariant | null;
  adventure: Adventure | null;
  completedAdventures: AdventureId[];
  wardrobe: OutfitId[];
  equippedOutfit: OutfitId | null;
  events: GameEvent[];
}

export type GameEvent =
  | { type: 'grew-up'; stage: 'teen' | 'adult'; variant?: AdultVariant }
  | { type: 'returned'; adventureId: AdventureId; outfitFound: OutfitId | null };

export interface Settings {
  soundOn: boolean;
}

export interface GameState {
  version: 1;
  bunny: Bunny | null;
  settings: Settings;
}

export type RefusalReason =
  | 'full'
  | 'tired'
  | 'not-sleepy'
  | 'not-sick'
  | 'no-bunny'
  | 'has-bunny'
  | 'invalid-name'
  | 'invalid-state'
  | 'away'
  | 'asleep'
  | 'awake'
  | 'baby'
  | 'sick'
  | 'depressed'
  | 'not-owned'
  | 'no-event';

export type ActionResult = 'ok' | { refused: RefusalReason };

export interface ActionOutcome {
  state: GameState;
  result: ActionResult;
}

export type GameAction =
  | { type: 'adopt'; name: string }
  | { type: 'feed' }
  | { type: 'play' }
  | { type: 'clean' }
  | { type: 'sleep' }
  | { type: 'wake' }
  | { type: 'medicine' }
  | { type: 'startAdventure'; id: AdventureId }
  | { type: 'equip'; outfitId: OutfitId }
  | { type: 'unequip' }
  | { type: 'dismissEvent' }
  | { type: 'startOver' }
  | { type: 'setSound'; on: boolean }
  | { type: 'loadState'; state: GameState };
