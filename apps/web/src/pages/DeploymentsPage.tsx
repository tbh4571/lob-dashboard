import { useState } from 'react';
import { Box, Typography, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { trpc } from '../lib/trpc';
import { RunList } from '../components/RunList';
import type { RunStatus } from '@lob/shared';

export function DeploymentsPage() {
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');

  const { data: runs, isLoading } = trpc.runs.list.useQuery({
    type: 'cd',
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Deployments
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        CD (Repave / Harness) executions across all environments
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={statusFilter}
          onChange={(_, v) => v && setStatusFilter(v)}
        >
          <ToggleButton value="all">Any status</ToggleButton>
          <ToggleButton value="running">Running</ToggleButton>
          <ToggleButton value="success">Success</ToggleButton>
          <ToggleButton value="failed">Failed</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <RunList runs={runs} isLoading={isLoading} emptyMessage="No deployments match the current filters." />
    </Box>
  );
}
