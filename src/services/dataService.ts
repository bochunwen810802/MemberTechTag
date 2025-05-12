import Papa from 'papaparse';
import { JobRole, ScoringCriteria, MemberSkills, CategoryAverage } from '../types';

interface CSVRow {
  [key: string]: string;
}

// 加载 CSV 文件
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

// 处理成员数据
export const processMembers = (rawData: CSVRow[]): JobRole[] => {
  return rawData.map(row => ({
    name: row['姓名'],
    role: row['預設職能'],
  }));
};

// 处理技能分类数据
export const processSkillCategories = (rawData: CSVRow[]): ScoringCriteria[] => {
  return rawData.map(row => {
    const scores: { [key: string]: number } = {};
    Object.entries(row).forEach(([key, value]) => {
      if (key !== '技能分類') {
        scores[key.trim()] = Number(value);
      }
    });
    return {
      category: (row['技能分類'] ?? '').trim(),
      scores,
    };
  });
};

// 处理成员技能数据
export const processMemberSkills = (rawData: CSVRow[]): { [name: string]: { [category: string]: number } } => {
  const memberSkills: { [name: string]: { [category: string]: number } } = {};
  
  rawData.forEach(row => {
    const category = row['項目分類'];
    const name = row['項目名稱'];
    
    Object.entries(row)
      .filter(([key]) => key !== '項目分類' && key !== '項目名稱')
      .forEach(([memberName, value]) => {
        if (!memberSkills[memberName]) {
          memberSkills[memberName] = {};
        }
        memberSkills[memberName][category] = Number(value);
      });
  });

  return memberSkills;
};

// 计算分类平均值
export const calculateCategoryAverages = (memberSkills: { [name: string]: { [category: string]: number } }): CategoryAverage[] => {
  const categoryTotals: { [category: string]: { sum: number; count: number } } = {};

  Object.values(memberSkills).forEach(member => {
    Object.entries(member).forEach(([category, score]) => {
      if (!categoryTotals[category]) {
        categoryTotals[category] = { sum: 0, count: 0 };
      }
      categoryTotals[category].sum += score;
      categoryTotals[category].count += 1;
    });
  });

  return Object.entries(categoryTotals).map(([category, { sum, count }]) => ({
    category,
    average: sum / count,
  }));
};

// 获取所有成员技能数据
export const fetchAllData = async (): Promise<{
  members: JobRole[];
  skillCategories: ScoringCriteria[];
  memberSkills: MemberSkills[];
  categoryAverages: CategoryAverage[];
}> => {
  try {
    const [membersData, skillCategoriesData, memberSkillsData] = await Promise.all([
      loadCSVData('/File/Job.csv'),
      loadCSVData('/File/ScoringCriteria.csv'),
      loadCSVData('/File/RAW.csv'),
    ]);

    const members = processMembers(membersData);
    const skillCategories = processSkillCategories(skillCategoriesData);
    const rawMemberSkills = processMemberSkills(memberSkillsData);
    const categoryAverages = calculateCategoryAverages(rawMemberSkills);

    // 構建完整的成員技能資料
    const memberSkills: MemberSkills[] = members.map(member => {
      const skills = memberSkillsData
        .filter(row => row['項目分類'] && row['項目名稱'])
        .map(row => {
          const category = (row['項目分類'] ?? '').trim();
          const role = (member.role ?? '').trim();
          const criteria = skillCategories.find(
            criteria => (criteria.category ?? '').trim() === category
          );
          let expectedScore = 0;
          if (criteria && criteria.scores) {
            // 強制用 entries 找到 key
            const found = Object.entries(criteria.scores).find(
              ([k]) => (k ?? '').trim() === role
            );
            expectedScore = found ? found[1] : 0;
            // 印出所有 key 與 role
            console.log('criteria.scores keys:', Object.keys(criteria.scores));
            console.log('role:', role, 'matched key:', found ? found[0] : '無');
          }
          console.log('分類:', category, '職能:', role, '標準:', expectedScore);
          return {
            category: category,
            name: row['項目名稱'],
            score: Number(row[member.name] || 0),
            expectedScore: Number(expectedScore),
          };
        });

      return {
        name: member.name,
        role: member.role,
        skills,
      };
    });

    return {
      members,
      skillCategories,
      memberSkills,
      categoryAverages,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}; 