import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MemberSkills } from '../types';

interface RadarChartProps {
  memberSkills: MemberSkills;
}

const SkillRadarChart: React.FC<RadarChartProps> = ({ memberSkills }) => {
  // 按项目分类分组并计算平均值
  const categoryData = memberSkills.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = {
        actual: 0,
        expected: 0,
        count: 0,
      };
    }
    acc[skill.category].actual += skill.score;
    acc[skill.category].expected += skill.expectedScore;
    acc[skill.category].count += 1;
    return acc;
  }, {} as { [key: string]: { actual: number; expected: number; count: number } });

  // 转换为雷达图数据格式
  const data = Object.entries(categoryData).map(([category, values]) => ({
    subject: category,
    actual: Number((values.actual / values.count).toFixed(2)),
    expected: Number((values.expected / values.count).toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 3]} />
        <Radar
          name="實際能力"
          dataKey="actual"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Radar
          name="期望能力"
          dataKey="expected"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart; 