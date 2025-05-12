import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MemberSkills, ScoringCriteria } from '../types';

interface TeamStatsProps {
  memberSkills: MemberSkills[];
  skillCategories: ScoringCriteria[];
  selectedTeamRole: string;
  setSelectedTeamRole: (role: string) => void;
}

const TEAM_ROLES = ['TPM', 'BA', '維運', '系統分析', '架構', 'DE', 'DS'];

const TeamStats: React.FC<TeamStatsProps> = ({ memberSkills, skillCategories, selectedTeamRole, setSelectedTeamRole }) => {
  // 篩選出該職位的成員
  const filteredMembers = memberSkills.filter(m => m.role === selectedTeamRole);

  // 計算每個分類的團隊平均值
  const categoryStats = filteredMembers.reduce((acc, member) => {
    member.skills.forEach(skill => {
      if (!acc[skill.category]) {
        acc[skill.category] = {
          actualTotal: 0,
          expectedTotal: 0,
          count: 0,
          members: new Set(),
        };
      }
      // 依照職位抓標準
      const categoryCriteria = skillCategories.find(c => (c.category ?? '').trim() === (skill.category ?? '').trim());
      const expectedScore = categoryCriteria ? (categoryCriteria.scores[selectedTeamRole] || 0) : 0;
      acc[skill.category].actualTotal += skill.score;
      acc[skill.category].expectedTotal += expectedScore;
      acc[skill.category].count += 1;
      acc[skill.category].members.add(member.name);
    });
    return acc;
  }, {} as { [key: string]: { actualTotal: number; expectedTotal: number; count: number; members: Set<string> } });

  // 轉換為雷達圖和表格資料格式
  const radarData = Object.entries(categoryStats).map(([category, stats]) => ({
    subject: category,
    actual: Number((stats.actualTotal / stats.count).toFixed(2)),
    expected: Number((stats.expectedTotal / stats.count).toFixed(2)),
  }));

  const tableData = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    actualAverage: Number((stats.actualTotal / stats.count).toFixed(2)),
    expectedAverage: Number((stats.expectedTotal / stats.count).toFixed(2)),
    memberCount: stats.members.size,
    gap: Number((stats.actualTotal / stats.count - stats.expectedTotal / stats.count).toFixed(2)),
  }))
  // 依 gap 由大到小排序
  .sort((a, b) => b.gap - a.gap);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>選擇職位</InputLabel>
          <Select
            value={selectedTeamRole}
            label="選擇職位"
            onChange={e => setSelectedTeamRole(e.target.value)}
          >
            {TEAM_ROLES.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography sx={{ ml: 3 }} color="text.secondary">
          目前{selectedTeamRole}成員：{filteredMembers.map(m => m.name).join('、') || '無'}
        </Typography>
      </Box>
      <Box sx={{ mb: 4 }}>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 3]} />
            <Radar
              name="團隊實際能力"
              dataKey="actual"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="團隊期望能力"
              dataKey="expected"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>技能分類</TableCell>
              <TableCell align="right">實際平均分數</TableCell>
              <TableCell align="right">期望平均分數</TableCell>
              <TableCell align="right">差距</TableCell>
              <TableCell align="right">參與人數</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.category}>
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell align="right">{row.actualAverage}</TableCell>
                <TableCell align="right">{row.expectedAverage}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    color: row.gap >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}
                >
                  {row.gap > 0 ? `+${row.gap}` : row.gap}
                </TableCell>
                <TableCell align="right">{row.memberCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TeamStats; 