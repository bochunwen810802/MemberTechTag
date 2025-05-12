import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import SkillRadarChart from './components/RadarChart';
import SkillProgress from './components/SkillProgress';
import TeamStats from './components/TeamStats';
import { fetchAllData } from './services/dataService';
import { MemberSkills, CategoryAverage, ScoringCriteria } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [memberSkills, setMemberSkills] = useState<MemberSkills[]>([]);
  const [categoryAverages, setCategoryAverages] = useState<CategoryAverage[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [skillCategories, setSkillCategories] = useState<ScoringCriteria[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTeamRole, setSelectedTeamRole] = useState<string>('TPM');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { memberSkills, categoryAverages, skillCategories } = await fetchAllData();
        setMemberSkills(memberSkills);
        setCategoryAverages(categoryAverages);
        setSkillCategories(skillCategories);
        if (memberSkills.length > 0) {
          setSelectedMember(memberSkills[0].name);
          setSelectedRole(memberSkills[0].role);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMemberChange = (event: SelectChangeEvent) => {
    setSelectedMember(event.target.value);
    const member = memberSkills.find(m => m.name === event.target.value);
    setSelectedRole(member?.role ?? '');
  };

  const selectedMemberData = memberSkills.find(member => member.name === selectedMember);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        團隊技能評估系統
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="個人技能" />
          <Tab label="團隊統計" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel>選擇成員</InputLabel>
              <Select
                value={selectedMember}
                label="選擇成員"
                onChange={handleMemberChange}
              >
                {memberSkills.map((member) => (
                  <MenuItem key={member.name} value={member.name}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1 }}>
            {selectedMemberData && skillCategories.length > 0 && (
              <SkillProgress
                memberSkills={selectedMemberData}
                onMemberChange={setSelectedMember}
                allMembers={memberSkills.map(m => m.name)}
                skillCategories={skillCategories}
                allRoles={Object.keys(skillCategories[0]?.scores ?? {})}
                defaultRole={selectedMemberData.role}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                showRoleSelectOnly
              />
            )}
          </Box>
        </Box>
        {selectedMemberData && skillCategories.length > 0 && (
          <>
            <Box sx={{ mb: 4 }}>
              <SkillRadarChart
                memberSkills={selectedMemberData}
                selectedRole={selectedRole}
                skillCategories={skillCategories}
              />
            </Box>
            <SkillProgress
              memberSkills={selectedMemberData}
              onMemberChange={setSelectedMember}
              allMembers={memberSkills.map(m => m.name)}
              skillCategories={skillCategories}
              allRoles={Object.keys(skillCategories[0]?.scores ?? {})}
              defaultRole={selectedMemberData.role}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              hideRoleSelect
            />
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TeamStats
          memberSkills={memberSkills}
          skillCategories={skillCategories}
          selectedTeamRole={selectedTeamRole}
          setSelectedTeamRole={setSelectedTeamRole}
        />
      </TabPanel>
    </Container>
  );
}

export default App;
