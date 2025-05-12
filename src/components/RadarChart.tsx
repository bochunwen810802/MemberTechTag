import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MemberSkills, ScoringCriteria } from '../types';

interface RadarChartProps {
  memberSkills: MemberSkills;
  selectedRole: string;
  skillCategories: ScoringCriteria[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isLack = payload[0]?.payload.isLack;
    return (
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8 }}>
        <strong>{label}</strong>
        <div>實際平均: {payload[0]?.payload.actual}</div>
        <div>期望平均: {payload[0]?.payload.expected}</div>
        {isLack && (
          <div
            style={{
              display: 'inline-block',
              background: '#fff3e0',
              color: '#ff9800',
              borderRadius: '10px',
              padding: '2px 10px',
              marginTop: 6,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 1,
              border: '1px solid #ffb74d'
            }}
          >
            不足
          </div>
        )}
      </div>
    );
  }
  return null;
};

const SkillRadarChart: React.FC<RadarChartProps> = ({ memberSkills, selectedRole, skillCategories }) => {
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
    // 依照 selectedRole 計算期望能力
    const categoryCriteria = skillCategories.find(c => (c.category ?? '').trim() === (skill.category ?? '').trim());
    acc[skill.category].expected += categoryCriteria ? (categoryCriteria.scores[selectedRole] || 0) : 0;
    acc[skill.category].count += 1;
    return acc;
  }, {} as { [key: string]: { actual: number; expected: number; count: number } });

  // 转换为雷达图数据格式
  const data = Object.entries(categoryData).map(([category, values]) => ({
    subject: category,
    actual: Number((values.actual / values.count).toFixed(2)),
    expected: Number((values.expected / values.count).toFixed(2)),
    isLack: (values.actual / values.count) < (values.expected / values.count),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          tick={(props) => {
            const { payload, x, y, textAnchor, stroke, index } = props;
            const isLack = data[index]?.isLack;
            return (
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                fill={isLack ? '#ff9800' : '#666'}
                fontWeight="normal"
                fontSize={14}
              >
                {payload.value}
              </text>
            );
          }}
        />
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart; 