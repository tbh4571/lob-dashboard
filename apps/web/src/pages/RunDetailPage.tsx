import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { trpc } from '../lib/trpc';
import { SubwayMap } from '../components/SubwayMap';

function formatDuration(ms?: number) {
  if (ms == null) return '\u2014';
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

export function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: run, isLoading } = trpc.runs.byId.useQuery({ id: id! }, { enabled: !!id });

  if (isLoading) {
    return (
      <Box>
        <Skeleton width={280} height={40} />
        <Skeleton height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!run) {
    return <Typography>Run not found</Typography>;
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/runs" underline="hover" color="inherit">
          Runs
        </Link>
        <Typography color="text.primary">{run.label}</Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {run.label}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={run.type === 'ci' ? 'CI / Rebase (GitHub Actions)' : 'CD / Repave (Harness)'}
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
            <Chip size="small" label={run.trigger} />
          </Stack>
        </Box>
        {run.externalUrl && (
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            href={run.externalUrl}
            target="_blank"
            rel="noopener"
          >
            Open in {run.type === 'ci' ? 'GitHub' : 'Harness'}
          </Button>
        )}
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Start
              </Typography>
              <Typography fontWeight={600}>{new Date(run.startTime).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                End
              </Typography>
              <Typography fontWeight={600}>
                {run.endTime ? new Date(run.endTime).toLocaleString() : '\u2014'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>
              <Typography fontWeight={600}>{formatDuration(run.durationMs)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Triggered by
              </Typography>
              <Typography fontWeight={600}>{run.triggeredBy ?? '\u2014'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {run.environments && run.environments.length > 0 && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Target environments:{' '}
          {run.environments.map((e) => (
            <Chip key={e} size="small" label={e} sx={{ mr: 0.5 }} />
          ))}
        </Typography>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Pipeline steps
      </Typography>
      <Card variant="outlined" sx={{ p: 2 }}>
        <SubwayMap steps={run.steps} />
      </Card>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={2}>
        <Button component={RouterLink} to={`/components/${run.componentId}`} variant="outlined">
          View Component
        </Button>
        <Button component={RouterLink} to={`/applications/${run.applicationId}`} variant="text">
          View Application
        </Button>
      </Stack>
    </Box>
  );
}
