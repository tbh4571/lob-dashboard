import { useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BuildIcon from '@mui/icons-material/Build';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getApplicationById, getComponentById } from '../lib/mockData';
import { useDataStore, type ScheduleFormInput } from '../lib/store';
import { usePersona } from '../lib/persona';
import { capitalize, envStatusColor, runStatusColor } from '../lib/status';
import { cronExpression, describeMode, describeNextRun, describeSchedule } from '../lib/scheduleFormat';
import { ScheduleFormDialog } from '../components/ScheduleFormDialog';
import type { Environment, Schedule } from '../types';

export function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { listSchedulesByComponent, listRuns, toggleSchedule, createSchedule, updateSchedule, triggerRebase, triggerRepave } =
    useDataStore();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [repaveOpen, setRepaveOpen] = useState(false);
  const [repaveEnvs, setRepaveEnvs] = useState<Environment[]>(['nonprod']);

  const component = id ? getComponentById(id) : undefined;

  if (!component) {
    return <Typography>Component not found</Typography>;
  }

  const application = getApplicationById(component.applicationId);
  const schedules = listSchedulesByComponent(component.id);
  const runs = listRuns({ componentId: component.id, limit: 10 });

  const canManage = persona.role === 'developer' || persona.role === 'operations';
  const canProd = persona.role === 'operations';

  const openNewSchedule = () => {
    setEditingSchedule(undefined);
    setScheduleDialogOpen(true);
  };

  const openEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = (input: ScheduleFormInput) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, input);
    } else {
      createSchedule(component.id, persona.id, input);
    }
    setScheduleDialogOpen(false);
  };

  const toggleRepaveEnv = (env: Environment) => {
    setRepaveEnvs((prev) => (prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]));
  };

  const handleRebase = () => {
    const run = triggerRebase(component.id, persona.id);
    navigate(`/runs/${run.id}`);
  };

  const handleStartRepave = () => {
    const run = triggerRepave(component.id, repaveEnvs, persona.id);
    setRepaveOpen(false);
    navigate(`/runs/${run.id}`);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/applications" underline="hover" color="inherit">
          Applications
        </Link>
        {application && (
          <Link component={RouterLink} to={`/applications/${application.id}`} underline="hover" color="inherit">
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
        </Box>

        {canManage && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<BuildIcon />} onClick={handleRebase}>
              Rebase
            </Button>
            <Button variant="contained" startIcon={<RocketLaunchIcon />} onClick={() => setRepaveOpen(true)}>
              Repave
            </Button>
          </Stack>
        )}
      </Stack>

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
                    <Chip size="small" label={capitalize(st?.status ?? 'unknown')} color={envStatusColor(st?.status)} />
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
                  {st?.replicas != null && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Replicas: {st.readyReplicas}/{st.replicas}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Schedules
        </Typography>
        {canManage && (
          <Button size="small" startIcon={<AddIcon />} onClick={openNewSchedule}>
            New schedule
          </Button>
        )}
      </Stack>
      {schedules.length > 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Schedule</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Next run</TableCell>
                <TableCell>Status</TableCell>
                {canManage && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Typography variant="body2">{describeSchedule(s)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      <code>{cronExpression(s)}</code>
                      {s.frequency === 'biweekly' && ' · every 2 weeks'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {component.currentImageTag ? (
                      <code>{component.imageRepository}:{component.currentImageTag}</code>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={describeMode(s.mode)} />
                  </TableCell>
                  <TableCell>{describeNextRun(s)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.enabled ? 'Enabled' : 'Paused'} color={s.enabled ? 'success' : 'default'} />
                  </TableCell>
                  {canManage && (
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditSchedule(s)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={s.enabled ? 'Pause' : 'Resume'}>
                        <IconButton size="small" onClick={() => toggleSchedule(s.id)}>
                          {s.enabled ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
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
            {runs.map((run) => (
              <TableRow key={run.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/runs/${run.id}`)}>
                <TableCell>{run.label}</TableCell>
                <TableCell>
                  <Chip size="small" label={run.type === 'ci' ? 'CI' : 'CD'} variant="outlined" />
                </TableCell>
                <TableCell>{capitalize(run.trigger)}</TableCell>
                <TableCell>{new Date(run.startTime).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip size="small" label={capitalize(run.status)} color={runStatusColor(run.status)} />
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
            {runs.length === 0 && (
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

      <ScheduleFormDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        canTargetProduction={canProd}
      />

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
                    checked={repaveEnvs.includes(env)}
                    onChange={() => toggleRepaveEnv(env)}
                    disabled={env === 'production' && !canProd}
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span style={{ textTransform: 'capitalize' }}>{env}</span>
                    {env === 'production' && !canProd && <Chip size="small" label="Ops only" color="warning" />}
                  </Stack>
                }
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepaveOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={repaveEnvs.length === 0} onClick={handleStartRepave}>
            Start Repave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
