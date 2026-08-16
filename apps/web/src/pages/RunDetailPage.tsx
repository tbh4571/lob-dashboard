import { Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, Stack, Breadcrumbs, Link, Button, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useDataStore } from '../lib/store';
import { capitalize, runStatusColor } from '../lib/status';
import { SubwayMap } from '../components/SubwayMap';

function formatDuration(ms?: number) {
  if (ms == null) return '—';
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

export function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getRunById } = useDataStore();
  const run = id ? getRunById(id) : undefined;

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

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            {run.label}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={run.type === 'ci' ? 'CI / Rebase (GitHub Actions)' : 'CD / Repave (Harness)'} variant="outlined" />
            <Chip size="small" label={capitalize(run.status)} color={runStatusColor(run.status)} />
            <Chip size="small" label={capitalize(run.trigger)} />
          </Stack>
        </Box>
        {run.externalUrl && (
          <Button variant="outlined" startIcon={<OpenInNewIcon />} href={run.externalUrl} target="_blank" rel="noopener">
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
              <Typography fontWeight={600}>{run.endTime ? new Date(run.endTime).toLocaleString() : '—'}</Typography>
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
              <Typography fontWeight={600}>{run.triggeredBy ?? '—'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {run.environments && run.environments.length > 0 && (
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          Target environments:{' '}
          {run.environments.map((e) => (
            <Chip key={e} size="small" label={capitalize(e)} sx={{ mr: 0.5 }} />
          ))}
        </Typography>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Pipeline Steps
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
