import { useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { trpc } from '../lib/trpc';
import { envStatusColor, envStatusLabel } from '../lib/status';
import type { Environment } from '@lob/shared';

export function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();
  const { data, isLoading } = trpc.components.byId.useQuery({ id: id! }, { enabled: !!id });
  const { data: runs } = trpc.runs.list.useQuery({ componentId: id, limit: 10 }, { enabled: !!id });
  const { data: schedules } = trpc.schedules.list.useQuery({ componentId: id }, { enabled: !!id });

  const [repaveOpen, setRepaveOpen] = useState(false);
  const [selectedEnvs, setSelectedEnvs] = useState<Environment[]>(['nonprod']);

  const rebaseMutation = trpc.actions.rebase.useMutation({
    onSuccess: (run) => {
      utils.runs.list.invalidate();
      navigate(`/runs/${run.id}`);
    },
  });

  const repaveMutation = trpc.actions.repave.useMutation({
    onSuccess: (run) => {
      setRepaveOpen(false);
      utils.runs.list.invalidate();
      navigate(`/runs/${run.id}`);
    },
  });

  const canManage = user?.role === 'developer' || user?.role === 'operations';
  const canProd = user?.role === 'operations';

  if (isLoading || !data) {
    return (
      <Box>
        <Skeleton width={240} height={40} />
        <Skeleton height={160} sx={{ mt: 2 }} />
      </Box>
    );
  }

  const { application, ...component } = data;

  const toggleEnv = (env: Environment) => {
    setSelectedEnvs((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
    );
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/applications" underline="hover" color="inherit">
          Applications
        </Link>
        {application && (
          <Link
            component={RouterLink}
            to={`/applications/${application.id}`}
            underline="hover"
            color="inherit"
          >
            {application.name}
          </Link>
        )}
        <Typography color="text.primary">{component.name}</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {component.name}
          </Typography>
          <Typography color="text.secondary">{component.description}</Typography>
          {component.currentImageTag && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Image: <code>{component.imageRepository}:{component.currentImageTag}</code>
            </Typography>
          )}
        </Box>

        {canManage && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<BuildIcon />}
              onClick={() => rebaseMutation.mutate({ componentId: component.id })}
              disabled={rebaseMutation.isPending}
            >
              Rebase
            </Button>
            <Button
              variant="contained"
              startIcon={<RocketLaunchIcon />}
              onClick={() => setRepaveOpen(true)}
            >
              Repave
            </Button>
          </Stack>
        )}
      </Stack>

      {/* Environment status */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Environments
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(['nonprod', 'preprod', 'production'] as const).map((env) => {
          const st = component.environments[env];
          return (
            <Grid key={env} size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={600} textTransform="capitalize">
                      {env}
                    </Typography>
                    <Chip size="small" label={envStatusLabel(st?.status)} color={envStatusColor(st?.status)} />
                  </Stack>
                  {st?.version && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Version: {st.version}
                    </Typography>
                  )}
                  {st?.lastDeployedAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last deploy: {new Date(st.lastDeployedAt).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Schedules */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Schedules
      </Typography>
      {schedules && schedules.length > 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Cron</TableCell>
                <TableCell>Environments</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    <code>{s.cron}</code>
                  </TableCell>
                  <TableCell>{s.environments.join(', ')}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.enabled ? 'Enabled' : 'Disabled'} color={s.enabled ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          No schedules configured.
        </Typography>
      )}

      {/* Recent runs */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Runs
      </Typography>
      <Card variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs?.map((run) => (
              <TableRow key={run.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/runs/${run.id}`)}>
                <TableCell>{run.label}</TableCell>
                <TableCell>
                  <Chip size="small" label={run.type === 'ci' ? 'CI' : 'CD'} variant="outlined" />
                </TableCell>
                <TableCell>{run.trigger}</TableCell>
                <TableCell>{new Date(run.startTime).toLocaleString()}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell align="right">
                  {run.externalUrl && (
                    <Tooltip title="Open in GitHub / Harness">
                      <IconButton
                        size="small"
                        href={run.externalUrl}
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!runs || runs.length === 0) && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" align="center">
                    No runs yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Repave dialog */}
      <Dialog open={repaveOpen} onClose={() => setRepaveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Repave component</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select target environments. Production requires Operations role.
          </Typography>
          <FormGroup>
            {(['nonprod', 'preprod', 'production'] as const).map((env) => (
              <FormControlLabel
                key={env}
                control={
                  <Checkbox
                    checked={selectedEnvs.includes(env)}
                    onChange={() => toggleEnv(env)}
                    disabled={env === 'production' && !canProd}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span style={{ textTransform: 'capitalize' }}>{env}</span>
                    {env === 'production' && !canProd && (
                      <Chip size="small" label="Ops only" color="warning" />
                    )}
                  </Stack>
                }
              />
            ))}
          </FormGroup>
          {repaveMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {repaveMutation.error.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepaveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={selectedEnvs.length === 0 || repaveMutation.isPending}
            onClick={() =>
              repaveMutation.mutate({ componentId: component.id, environments: selectedEnvs })
            }
          >
            Start Repave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
