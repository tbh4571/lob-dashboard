import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { Application, Component, PipelineRun } from '@lob/shared';
import { envStatusColor, envStatusLabel } from '../../lib/status';

interface Props {
  applications: Application[];
  components: Component[];
  runs: PipelineRun[];
}

type EnvStatus = 'healthy' | 'degraded' | 'unknown' | 'deploying';

// Higher = more concerning. Used to pick the worst environment status across a group of components.
const SEVERITY: Record<EnvStatus, number> = { degraded: 3, unknown: 2, deploying: 1, healthy: 0 };

export function ExecutiveOverview({ applications, components, runs }: Props) {
  const prodComponents = components.filter((c) => c.environments.production);
  const healthyProdCount = prodComponents.filter(
    (c) => c.environments.production?.status === 'healthy',
  ).length;
  const prodHealthPct =
    prodComponents.length > 0 ? Math.round((healthyProdCount / prodComponents.length) * 100) : 100;

  const prodDeploys = runs.filter((r) => r.type === 'cd' && r.environments?.includes('production'));
  const failedProdDeploys = prodDeploys.filter((r) => r.status === 'failed').length;
  const changeFailureRate =
    prodDeploys.length > 0 ? Math.round((failedProdDeploys / prodDeploys.length) * 100) : 0;

  const appRows = applications.map((app) => {
    const appComponents = components.filter((c) => c.applicationId === app.id);
    const worstStatus = appComponents.reduce<EnvStatus>((worst, c) => {
      const status: EnvStatus = c.environments.production?.status ?? 'unknown';
      return SEVERITY[status] > SEVERITY[worst] ? status : worst;
    }, 'healthy');
    const lastDeployedAt = appComponents
      .map((c) => c.environments.production?.lastDeployedAt)
      .filter((d): d is string => !!d)
      .sort()
      .at(-1);

    return { app, componentCount: appComponents.length, worstStatus, lastDeployedAt };
  });

  const needsAttention = appRows.filter((r) => SEVERITY[r.worstStatus] >= 2);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShieldIcon color={prodHealthPct === 100 ? 'success' : 'warning'} />
                <Typography variant="h5" fontWeight={700}>
                  {prodHealthPct}%
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Production health
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberIcon color={needsAttention.length > 0 ? 'warning' : 'success'} />
                <Typography variant="h5" fontWeight={700}>
                  {needsAttention.length}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Applications needing attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TrendingDownIcon color={changeFailureRate > 0 ? 'error' : 'success'} />
                <Typography variant="h5" fontWeight={700}>
                  {changeFailureRate}%
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Production change failure rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Application Portfolio Health
      </Typography>
      <Card variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Application</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Components</TableCell>
              <TableCell>Production status</TableCell>
              <TableCell>Last production deploy</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appRows.map(({ app, componentCount, worstStatus, lastDeployedAt }) => (
              <TableRow key={app.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/applications/${app.id}`} underline="hover">
                    {app.name}
                  </Link>
                </TableCell>
                <TableCell>{app.owner ?? '—'}</TableCell>
                <TableCell>{componentCount}</TableCell>
                <TableCell>
                  {componentCount > 0 ? (
                    <Chip size="small" label={envStatusLabel(worstStatus)} color={envStatusColor(worstStatus)} />
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {lastDeployedAt ? new Date(lastDeployedAt).toLocaleDateString() : '—'}
                </TableCell>
              </TableRow>
            ))}
            {appRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" align="center">
                    No applications yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
