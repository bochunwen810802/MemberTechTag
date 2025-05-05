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
import RawDataTable from './components/RawDataTable';
import {
  loadCSVData,
  processSkillData,
  processJobData,
  processScoringCriteria,
  calculateCategoryAverages,
  getMemberSkills,
} from './services/dataService';
import { MemberSkills, CategoryAverage } from './types';
import TeamStats from './components/TeamStats';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rawData, jobData, scoringData] = await Promise.all([
          loadCSVData('/File/RAW.csv'),
          loadCSVData('/File/Job.csv'),
          loadCSVData('/File/ScoringCriteria.csv'),
        ]);

        const processedSkillData = processSkillData(rawData);
        const processedJobData = processJobData(jobData);
        const processedScoringCriteria = processScoringCriteria(scoringData);

        const members = getMemberSkills(
          processedSkillData,
          processedJobData,
          processedScoringCriteria
        );
        const averages = calculateCategoryAverages(processedSkillData);

        setMemberSkills(members);
        setCategoryAverages(averages);
        if (members.length > 0) {
          setSelectedMember(members[0].name);
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
    const member = memberSkills.find(m => m.name === event.target.value);
    if (member) {
      setSelectedMember(member.name);
    }
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
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>選擇成員</InputLabel>
            <Select
              value={selectedMember}
              label="選擇成員"
              onChange={handleMemberChange}
            >
              {memberSkills.map((member) => (
                <MenuItem key={member.name} value={member.name}>
                  {member.name} - {member.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {selectedMemberData && (
          <>
            <Box sx={{ mb: 4 }}>
              <SkillRadarChart memberSkills={selectedMemberData} />
            </Box>
            <SkillProgress
              memberSkills={selectedMemberData}
              onMemberChange={setSelectedMember}
              allMembers={memberSkills.map(m => m.name)}
            />
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TeamStats memberSkills={memberSkills} />
      </TabPanel>
    </Container>
  );
}

export default App;
