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

export interface Member {
  name: string;
  role: string;
}

export interface SkillCategory {
  category: string;
  scores: {
    [role: string]: number;
  };
}

export interface MemberSkill {
  category: string;
  name: string;
  score: number;
  expectedScore: number;
}

export interface MemberSkills {
  name: string;
  role: string;
  skills: MemberSkill[];
}

export interface CategoryAverage {
  category: string;
  average: number;
} 