import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  MenuItem,
} from '@mui/material';
import { useDataStore } from '../lib/store';
import { runUrl, listApplications, listComponents, listComponentsByApplication } from '../lib/mockData';
import { capitalize, runStatusColor } from '../lib/status';
import { usePagination } from '../lib/usePagination';
import { PaginationFooter } from '../components/PaginationFooter';
import type { RunStatus } from '../types';

export function RunsPage() {
  const { listRuns } = useDataStore();
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');

  const applications = listApplications();
  const componentOptions = applicationFilter === 'all' ? listComponents() : listComponentsByApplication(applicationFilter);

  const filteredRuns = listRuns({
    type: 'ci',
    status: statusFilter === 'all' ? undefined : statusFilter,
    applicationId: applicationFilter === 'all' ? undefined : applicationFilter,
    componentId: componentFilter === 'all' ? undefined : componentFilter,
  });
  const { page, setPage, pageCount, start, total, limit, pageItems: runs } = usePagination(filteredRuns, 10);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        CI (Rebase / GitHub Actions) executions
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} flexWrap="wrap" rowGap={2}>
        <TextField
          select
          size="small"
          label="Application"
          value={applicationFilter}
          onChange={(e) => {
            setApplicationFilter(e.target.value);
            setComponentFilter('all');
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All applications</MenuItem>
          {applications.map((app) => (
            <MenuItem key={app.id} value={app.id}>
              {app.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Component"
          value={componentFilter}
          onChange={(e) => {
            setComponentFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All components</MenuItem>
          {componentOptions.map((comp) => (
            <MenuItem key={comp.id} value={comp.id}>
              {comp.name}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={statusFilter}
          onChange={(_, v) => {
            if (v) {
              setStatusFilter(v);
              setPage(0);
            }
          }}
        >
          <ToggleButton value="all">Any status</ToggleButton>
          <ToggleButton value="running">Running</ToggleButton>
          <ToggleButton value="success">Success</ToggleButton>
          <ToggleButton value="failed">Failed</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        {runs.map((run) => (
          <Card key={run.id} variant="outlined">
            <CardActionArea component={RouterLink} to={runUrl(run)}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
                  <Box>
                    <Typography fontWeight={600}>{run.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(run.startTime).toLocaleString()}
                      {run.endTime && ` → ${new Date(run.endTime).toLocaleString()}`}
                      {' · '}
                      {capitalize(run.trigger)}
                    </Typography>
                  </Box>
                  <Chip size="small" label={capitalize(run.status)} color={runStatusColor(run.status)} />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        {total === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No runs match the current filters.
          </Typography>
        )}
      </Stack>
      <PaginationFooter page={page} pageCount={pageCount} total={total} limit={limit} start={start} onChange={setPage} />
    </Box>
  );
}
