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
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { trpc } from '../lib/trpc';
import type { RunStatus, RunType } from '@lob/shared';

export function RunsPage() {
  const [typeFilter, setTypeFilter] = useState<RunType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RunStatus | 'all'>('all');

  const { data: runs, isLoading } = trpc.runs.list.useQuery({
    type: typeFilter === 'all' ? undefined : typeFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Pipeline Runs
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        CI (Rebase / GitHub Actions) and CD (Repave / Harness) executions
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={typeFilter}
          onChange={(_, v) => v && setTypeFilter(v)}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="ci">CI / Rebase</ToggleButton>
          <ToggleButton value="cd">CD / Repave</ToggleButton>
        </ToggleButtonGroup>

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

      {isLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Stack>
      ) : (
        <Stack spacing={1}>
          {runs?.map((run) => (
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
                        {run.trigger}
                        {run.environments && ` · ${run.environments.join(', ')}`}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        size="small"
                        label={run.type === 'ci' ? 'CI / Rebase' : 'CD / Repave'}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={run.status}
                        color={
                          run.status === 'success'
                            ? 'success'
                            : run.status === 'failed'
                              ? 'error'
                              : run.status === 'running'
                                ? 'info'
                                : 'default'
                        }
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
          {runs?.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No runs match the current filters.
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}
