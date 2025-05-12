import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { MemberSkills, ScoringCriteria } from '../types';

interface SkillProgressProps {
  memberSkills: MemberSkills;
  onMemberChange: (memberName: string) => void;
  allMembers: string[];
  skillCategories: ScoringCriteria[];
  allRoles: string[];
  defaultRole: string;
  showRoleSelectOnly?: boolean;
  hideRoleSelect?: boolean;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

const SkillProgress: React.FC<SkillProgressProps> = ({
  memberSkills,
  onMemberChange,
  allMembers,
  skillCategories,
  allRoles,
  defaultRole,
  showRoleSelectOnly,
  hideRoleSelect,
  selectedRole,
  setSelectedRole,
}) => {
  // 将 useState 移到组件顶层
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

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

  // 只顯示職能下拉（主畫面右側）
  if (showRoleSelectOnly) {
    return (
      <FormControl fullWidth>
        <InputLabel>選擇職能</InputLabel>
        <Select
          value={selectedRole}
          label="選擇職能"
          onChange={e => setSelectedRole(e.target.value)}
        >
          {allRoles.map(role => (
            <MenuItem key={role} value={role}>{role}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // 整理大分類資料，計算平均落差，並排序
  const tableData = Object.entries(categoryStats).map(([category, stats]) => {
    const safeCategory = (category ?? '').trim();
    const safeRole = (selectedRole ?? '').trim();
    const categoryCriteria = skillCategories.find(c => (c.category ?? '').trim() === safeCategory);
    const expectedAverage = categoryCriteria ? (categoryCriteria.scores[safeRole] || 0) : 0;
    const actualAverage = stats.totalActual / stats.count;
    const gap = actualAverage - expectedAverage;
    // 小分類依落差排序
    const sortedSkills = [...stats.skills].sort((a, b) => (b.score - b.expectedScore) - (a.score - a.expectedScore));
    return {
      category,
      actualAverage: Number(actualAverage.toFixed(2)),
      expectedAverage: Number(expectedAverage.toFixed(2)),
      gap: Number(gap.toFixed(2)),
      skills: sortedSkills,
    };
  }).sort((a, b) => b.gap - a.gap);

  const handleToggle = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!hideRoleSelect && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>選擇職能</InputLabel>
          <Select
            value={selectedRole}
            label="選擇職能"
            onChange={e => setSelectedRole(e.target.value)}
          >
            {allRoles.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>技能大分類</TableCell>
              <TableCell align="right">實際平均分數</TableCell>
              <TableCell align="right">期望平均分數</TableCell>
              <TableCell align="right">落差</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map(row => (
              <React.Fragment key={row.category}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleToggle(row.category)}>
                      {openCategories[row.category] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">{row.category}</TableCell>
                  <TableCell align="right">{row.actualAverage}</TableCell>
                  <TableCell align="right">{row.expectedAverage}</TableCell>
                  <TableCell align="right" sx={{ color: row.gap >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                    {row.gap > 0 ? `+${row.gap}` : row.gap}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={openCategories[row.category]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>技能小分類</TableCell>
                              <TableCell align="right">實際分數</TableCell>
                              <TableCell align="right">期望分數</TableCell>
                              <TableCell align="right">落差</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.skills.map(skill => {
                              const gap = skill.score - skill.expectedScore;
                              return (
                                <TableRow key={skill.name}>
                                  <TableCell>{skill.name}</TableCell>
                                  <TableCell align="right">{skill.score}</TableCell>
                                  <TableCell align="right">{skill.expectedScore}</TableCell>
                                  <TableCell align="right" sx={{ color: gap >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                    {gap > 0 ? `+${gap}` : gap}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SkillProgress; 