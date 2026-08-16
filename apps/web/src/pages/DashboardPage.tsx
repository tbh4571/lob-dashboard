import { Box, Typography } from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { usePersona } from '../lib/persona';
import { listApplications, listComponents } from '../lib/mockData';
import { useDataStore } from '../lib/store';
import { StatGrid, type StatTile } from '../components/StatGrid';
import { AttentionQueue } from '../components/AttentionQueue';
import { ExecutiveOverview, executiveStats } from './dashboard/ExecutiveOverview';
import { DeveloperOverview, developerStats } from './dashboard/DeveloperOverview';
import { OperationsOverview, operationsStats } from './dashboard/OperationsOverview';

export function DashboardPage() {
  const { persona } = usePersona();
  const { schedules, listRuns } = useDataStore();
  const applications = listApplications();
  const components = listComponents();
  const runs = listRuns({ limit: 20 });
  const failedRuns = listRuns({ status: 'failed' });

  const successCount = runs.filter((r) => r.status === 'success').length;
  const failedCount = runs.filter((r) => r.status === 'failed').length;
  const runningCount = runs.filter((r) => r.status === 'running').length;

  const baseTiles: StatTile[] = [
    { key: 'applications', icon: <AppsIcon color="primary" />, value: applications.length, label: 'Applications' },
    { key: 'successful-runs', icon: <CheckCircleIcon color="success" />, value: successCount, label: 'Successful runs' },
    { key: 'failed-runs', icon: <ErrorIcon color="error" />, value: failedCount, label: 'Failed runs' },
    { key: 'running-now', icon: <TimelineIcon color="info" />, value: runningCount, label: 'Running now' },
  ];

  const personaTiles =
    persona.role === 'executive'
      ? executiveStats(applications, components, runs)
      : persona.role === 'operations'
        ? operationsStats(schedules)
        : developerStats(runs);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Welcome, {persona.name.split(' ')[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Line of Business applications, components, and pipeline visibility
      </Typography>

      <StatGrid tiles={[...baseTiles, ...personaTiles]} />

      <AttentionQueue runs={failedRuns} />

      {persona.role === 'executive' ? (
        <ExecutiveOverview applications={applications} components={components} />
      ) : persona.role === 'operations' ? (
        <OperationsOverview components={components} runs={runs} schedules={schedules} />
      ) : (
        <DeveloperOverview runs={runs} schedules={schedules} components={components} persona={persona} />
      )}
    </Box>
  );
}
