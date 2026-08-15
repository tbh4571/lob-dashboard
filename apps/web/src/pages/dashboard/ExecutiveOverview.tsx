import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Chip,
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
import { StatCardRow, type StatCardDef } from '../../components/StatCard';

interface Props {
  baseStats: StatCardDef[];
  applications: Application[];
  components: Component[];
  runs: PipelineRun[];
}

type EnvStatus = 'healthy' | 'degraded' | 'unknown' | 'deploying';

// Higher = more concerning. Used to pick the worst environment status across a group of components.
const SEVERITY: Record<EnvStatus, number> = { degraded: 3, unknown: 2, deploying: 1, healthy: 0 };

export function ExecutiveOverview({ baseStats, applications, components, runs }: Props) {
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

  const stats: StatCardDef[] = [
    ...baseStats,
    {
      icon: <ShieldIcon color={prodHealthPct === 100 ? 'success' : 'warning'} />,
      value: `${prodHealthPct}%`,
      label: 'Production health',
    },
    {
      icon: <WarningAmberIcon color={needsAttention.length > 0 ? 'warning' : 'success'} />,
      value: needsAttention.length,
      label: 'Applications needing attention',
    },
    {
      icon: <TrendingDownIcon color={changeFailureRate > 0 ? 'error' : 'success'} />,
      value: `${changeFailureRate}%`,
      label: 'Production change failure rate',
    },
  ];

  return (
    <Box>
      <StatCardRow stats={stats} />

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
