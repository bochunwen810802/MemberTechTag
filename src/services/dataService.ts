import Papa from 'papaparse';
import { SkillScore, JobRole, ScoringCriteria, CategoryAverage, MemberSkills } from '../types';

interface CSVRow {
  [key: string]: string;
}

export const loadCSVData = async (filePath: string): Promise<CSVRow[]> => {
  const response = await fetch(filePath);
  const csvText = await response.text();
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results: Papa.ParseResult<CSVRow>) => {
        resolve(results.data);
      },
    });
  });
};

export const processSkillData = (rawData: CSVRow[]): SkillScore[] => {
  return rawData.map(row => ({
    category: row['項目分類'],
    name: row['項目名稱'],
    scores: Object.fromEntries(
      Object.entries(row)
        .filter(([key]) => key !== '項目分類' && key !== '項目名稱')
        .map(([key, value]) => [key, Number(value)])
    ),
  }));
};

export const processJobData = (rawData: CSVRow[]): JobRole[] => {
  return rawData.map(row => ({
    name: row['姓名'],
    role: row['職能'],
  }));
};

export const processScoringCriteria = (rawData: CSVRow[]): ScoringCriteria[] => {
  return rawData.map(row => ({
    category: row['技能分類'],
    scores: Object.fromEntries(
      Object.entries(row)
        .filter(([key]) => key !== '技能分類')
        .map(([key, value]) => [key, Number(value)])
    ),
  }));
};

export const calculateCategoryAverages = (skillData: SkillScore[]): CategoryAverage[] => {
  const categoryMap = new Map<string, number[]>();
  
  skillData.forEach(skill => {
    if (!categoryMap.has(skill.category)) {
      categoryMap.set(skill.category, []);
    }
    Object.values(skill.scores).forEach(score => {
      categoryMap.get(skill.category)?.push(Number(score));
    });
  });

  return Array.from(categoryMap.entries()).map(([category, scores]) => ({
    category,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));
};

export const getMemberSkills = (
  skillData: SkillScore[],
  jobData: JobRole[],
  scoringCriteria: ScoringCriteria[]
): MemberSkills[] => {
  return jobData.map(member => {
    const memberSkills = skillData.map(skill => {
      const score = Number(skill.scores[member.name] || 0);
      const expectedScore = Number(
        scoringCriteria.find(criteria => criteria.category === skill.category)?.scores[member.role] || 0
      );

      return {
        category: skill.category,
        name: skill.name,
        score,
        expectedScore,
      };
    });

    return {
      name: member.name,
      role: member.role,
      skills: memberSkills,
    };
  });
};

export const fetchMemberSkills = async (): Promise<MemberSkills[]> => {
  try {
    const [rawData, jobData, scoringData] = await Promise.all([
      loadCSVData('/File/RAW.csv'),
      loadCSVData('/File/Job.csv'),
      loadCSVData('/File/ScoringCriteria.csv'),
    ]);

    const processedSkillData = processSkillData(rawData);
    const processedJobData = processJobData(jobData);
    const processedScoringCriteria = processScoringCriteria(scoringData);

    return getMemberSkills(
      processedSkillData,
      processedJobData,
      processedScoringCriteria
    );
  } catch (error) {
    console.error('Error fetching member skills:', error);
    throw error;
  }
}; 