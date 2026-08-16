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
} from '@mui/material';
import { useDataStore } from '../lib/store';
import { capitalize, runStatusColor } from '../lib/status';
import type { Environment, RunStatus } from '../types';

export function DeploymentsPage() {
  const { listRuns } = useDataStore();
  const [envFilter, setEnvFilter] = useState<Environment | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');

  const deployments = listRuns({
    type: 'cd',
    status: statusFilter === 'all' ? undefined : statusFilter,
    environment: envFilter === 'all' ? undefined : envFilter,
    limit: 50,
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        CD (Repave / Harness) deployments across every environment
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <ToggleButtonGroup size="small" exclusive value={envFilter} onChange={(_, v) => v && setEnvFilter(v)}>
          <ToggleButton value="all">All environments</ToggleButton>
          <ToggleButton value="nonprod">Nonprod</ToggleButton>
          <ToggleButton value="preprod">Preprod</ToggleButton>
          <ToggleButton value="production">Production</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup size="small" exclusive value={statusFilter} onChange={(_, v) => v && setStatusFilter(v)}>
          <ToggleButton value="all">Any status</ToggleButton>
          <ToggleButton value="running">Running</ToggleButton>
          <ToggleButton value="success">Success</ToggleButton>
          <ToggleButton value="failed">Failed</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        {deployments.map((run) => (
          <Card key={run.id} variant="outlined">
            <CardActionArea component={RouterLink} to={`/runs/${run.id}`}>
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
        {deployments.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No deployments match the current filters.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
