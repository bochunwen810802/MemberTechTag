export interface SkillScore {
  category: string;
  name: string;
  scores: { [key: string]: number };
}

export interface JobRole {
  name: string;
  role: string;
}

export interface ScoringCriteria {
  category: string;
  scores: { [key: string]: number };
}

export interface CategoryAverage {
  category: string;
  average: number;
}

export interface MemberSkills {
  name: string;
  role: string;
  skills: {
    category: string;
    name: string;
    score: number;
    expectedScore: number;
  }[];
} 