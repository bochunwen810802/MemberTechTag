import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import { MemberSkills } from '../types';

interface SkillProgressProps {
  memberSkills: MemberSkills;
  onMemberChange: (memberName: string) => void;
  allMembers: string[];
}

const SkillProgress: React.FC<SkillProgressProps> = ({
  memberSkills,
  onMemberChange,
  allMembers,
}) => {
  // 按项目分类分组并计算平均值
  const categoryStats = memberSkills.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = {
        skills: [],
        totalExpected: 0,
        totalActual: 0,
        count: 0
      };
    }
    acc[skill.category].skills.push(skill);
    acc[skill.category].totalExpected += skill.expectedScore;
    acc[skill.category].totalActual += skill.score;
    acc[skill.category].count += 1;
    return acc;
  }, {} as { [key: string]: { skills: typeof memberSkills.skills; totalExpected: number; totalActual: number; count: number } });

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3, 1fr)'
        },
        gap: 3 
      }}>
        {Object.entries(categoryStats).map(([category, stats]) => {
          const expectedAverage = stats.totalExpected / stats.count;
          const actualAverage = stats.totalActual / stats.count;
          
          return (
            <Box key={category}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {category}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    期望平均值: {expectedAverage.toFixed(2)}
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    color={actualAverage >= expectedAverage ? "success.main" : "error.main"}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    實際平均值: {actualAverage.toFixed(2)}
                    <LinearProgress
                      variant="determinate"
                      value={(actualAverage / expectedAverage) * 100}
                      sx={{ 
                        height: 4, 
                        width: 50, 
                        borderRadius: 2,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: actualAverage >= expectedAverage ? 'success.main' : 'error.main',
                        },
                      }}
                    />
                  </Typography>
                </Box>
                {stats.skills.map((skill) => (
                  <Box key={skill.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {skill.name}
                      </Typography>
                      <Typography variant="body2">
                        {skill.score} / {skill.expectedScore}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(skill.score / skill.expectedScore) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: skill.score >= skill.expectedScore ? 'success.main' : 'error.main',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SkillProgress; 