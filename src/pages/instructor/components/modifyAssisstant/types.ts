export interface Personality {
  id?: string;
  voice?: string;
  created_at?: string;
  assistant_id?: string;
  instruction_style: number;
  communication_style: number;
  response_length_style: number;
  formality_style: number;
  assertiveness_style: number;
  mood_style: number;
}

export interface ModifyAssistantFormData {
  name: string;
  tagline: string;
  description: string;
  personality?: Personality;
  language: string;
  avatar?: File | null;
  speciality: string;
  styleSettings: {
    coachingStyle: number;
    empathy: number;
    responseLength: number;
    formality: number;
    acceptance: number;
    seriousness: number;
  };
}

// Style tone mappings for the different personality aspects (1-5 scale)
export const StyleToneMap = {
  instructionStyle: {
    1: "Coaching style",
    2: "Mostly coaching",
    3: "Balanced",
    4: "Mostly mentoring",
    5: "Mentoring style",
  },
  communicationStyle: {
    1: "Empathetic",
    2: "Somewhat empathetic",
    3: "Neutral",
    4: "Somewhat direct",
    5: "Straight-talking",
  },
  responseLengthStyle: {
    1: "Very short",
    2: "Short",
    3: "Moderate length",
    4: "Long",
    5: "Very long",
  },
  formalityStyle: {
    1: "Very formal",
    2: "Formal",
    3: "Neutral",
    4: "Informal",
    5: "Very casual",
  },
  assertivenessStyle: {
    1: "Accepting",
    2: "Slightly accepting",
    3: "Balanced",
    4: "Slightly challenging",
    5: "Challenging",
  },
  moodStyle: {
    1: "Serious",
    2: "Mostly serious",
    3: "Neutral",
    4: "Mostly jovial",
    5: "Jovial",
  },
};

export const languageOptions = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Vietnamese", label: "Vietnamese" },
];

// Map slider values (0-100) to personality scale (1-5)
export const mapSliderToPersonalityValue = (value: number): number => {
  if (value === 0) return 1;
  if (value === 25) return 2;
  if (value === 50) return 3;
  if (value === 75) return 4;
  if (value === 100) return 5;
  return 3; // Default to middle value
};
