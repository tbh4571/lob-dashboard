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
import type { Environment, RunStatus } from '../types';

export function DeploymentsPage() {
  const { listRuns } = useDataStore();
  const [envFilter, setEnvFilter] = useState<Environment | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');

  const applications = listApplications();
  const componentOptions = applicationFilter === 'all' ? listComponents() : listComponentsByApplication(applicationFilter);

  const filteredDeployments = listRuns({
    type: 'cd',
    status: statusFilter === 'all' ? undefined : statusFilter,
    environment: envFilter === 'all' ? undefined : envFilter,
    applicationId: applicationFilter === 'all' ? undefined : applicationFilter,
    componentId: componentFilter === 'all' ? undefined : componentFilter,
  });
  const { page, setPage, pageCount, start, total, limit, pageItems: deployments } = usePagination(filteredDeployments, 10);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        CD (Repave / Harness) deployments across every environment
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
          value={envFilter}
          onChange={(_, v) => {
            if (v) {
              setEnvFilter(v);
              setPage(0);
            }
          }}
        >
          <ToggleButton value="all">All environments</ToggleButton>
          <ToggleButton value="nonprod">Nonprod</ToggleButton>
          <ToggleButton value="preprod">Preprod</ToggleButton>
          <ToggleButton value="production">Production</ToggleButton>
        </ToggleButtonGroup>

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
        {deployments.map((run) => (
          <Card key={run.id} variant="outlined">
            <CardActionArea component={RouterLink} to={runUrl(run)}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'center' }}
                  gap={1}
                >
                  <Box>
                    <Typography fontWeight={600}>{run.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(run.startTime).toLocaleString()}
                      {run.endTime && ` → ${new Date(run.endTime).toLocaleString()}`}
                      {' · '}
                      {capitalize(run.trigger)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {run.environments?.map((env) => (
                      <Chip
                        key={env}
                        size="small"
                        label={capitalize(env)}
                        variant="outlined"
                        color={env === 'production' ? 'secondary' : 'default'}
                      />
                    ))}
                    <Chip size="small" label={capitalize(run.status)} color={runStatusColor(run.status)} />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        {total === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No deployments match the current filters.
          </Typography>
        )}
      </Stack>
      <PaginationFooter page={page} pageCount={pageCount} total={total} limit={limit} start={start} onChange={setPage} />
    </Box>
  );
}
