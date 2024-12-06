export interface UserPreferences {
    favorites: {
      versions: string[];
      passages: {
        reference: string;
        text: string;
        version: string;
        timestamp: string;
      }[];
    };
    highlights: {
      [passageId: string]: {
        text: string;
        color: string;
        note?: string;
        timestamp: string;
        version: string;
      }[];
    };
    settings: {
      showVerseNumbers: boolean;
      font: 'sans' | 'serif' | 'script';
      theme: 'light' | 'dark' | 'cream';
        verseDisplay: 'paragraph' | 'list';
        fontSize: 'small' | 'medium' | 'large' | 'xl';
    };
  }