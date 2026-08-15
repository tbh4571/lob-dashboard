import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActionArea, Stack, Chip, Skeleton } from '@mui/material';
import type { PipelineRun } from '@lob/shared';
import { runStatusColor } from '../lib/status';

interface Props {
  runs: PipelineRun[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}

export function RunList({ runs, isLoading, emptyMessage = 'No runs match the current filters.' }: Props) {
  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </Stack>
    );
  }

  return (
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
                  <Chip size="small" label={run.status} color={runStatusColor(run.status)} />
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
      {runs?.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          {emptyMessage}
        </Typography>
      )}
    </Stack>
  );
}
