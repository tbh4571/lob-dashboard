import { useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
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
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BuildIcon from '@mui/icons-material/Build';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { applicationUrl, getApplicationById, getComponentBySlug, runUrl } from '../lib/mockData';
import { useDataStore, type ScheduleFormInput } from '../lib/store';
import { usePersona } from '../lib/persona';
import { capitalize, runStatusColor } from '../lib/status';
import { cronExpression, describeMode, describeNextRun, describeSchedule } from '../lib/scheduleFormat';
import { ScheduleFormDialog } from '../components/ScheduleFormDialog';
import { PaginationFooter } from '../components/PaginationFooter';
import { usePagination } from '../lib/usePagination';
import type { Environment, Schedule } from '../types';

export function ComponentDetailPage() {
  const { appSlug, componentSlug } = useParams<{ appSlug: string; componentSlug: string }>();
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { listSchedulesByComponent, listRuns, toggleSchedule, createSchedule, updateSchedule, triggerRebase, triggerRepave } =
    useDataStore();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);

  const component = appSlug && componentSlug ? getComponentBySlug(appSlug, componentSlug) : undefined;

  if (!component) {
    return <Typography>Component not found</Typography>;
  }

  const application = getApplicationById(component.applicationId);
  const schedules = listSchedulesByComponent(component.id);
  const rebaseRuns = usePagination(listRuns({ componentId: component.id, type: 'ci' }), 5);
  const repaveRuns = usePagination(listRuns({ componentId: component.id, type: 'cd' }), 5);

  const canManage = persona.role === 'developer' || persona.role === 'operations';
  const canProd = persona.role === 'operations';

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

  const handleRebase = () => {
    const run = triggerRebase(component.id, persona.id);
    navigate(runUrl(run));
  };

  const handleRepave = (env: Environment) => {
    const run = triggerRepave(component.id, [env], persona.id);
    navigate(runUrl(run));
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/applications" underline="hover" color="inherit">
          Applications
        </Link>
        {application && (
          <Link component={RouterLink} to={applicationUrl(application.id)} underline="hover" color="inherit">
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
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<BuildIcon />} onClick={handleRebase}>
              Rebase
            </Button>
            <Button variant="outlined" startIcon={<RocketLaunchIcon />} onClick={() => handleRepave('nonprod')}>
              Repave Nonprod
            </Button>
            <Button variant="outlined" startIcon={<RocketLaunchIcon />} onClick={() => handleRepave('preprod')}>
              Repave Preprod
            </Button>
            <Tooltip title={canProd ? '' : 'Operations role required'}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => handleRepave('production')}
                  disabled={!canProd}
                >
                  Repave Prod
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Schedules
      </Typography>
      {schedules.length > 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '19%' }}>Schedule</TableCell>
                <TableCell sx={{ width: '19%' }}>Latest Rebase Image</TableCell>
                <TableCell sx={{ width: '23%' }}>Mode</TableCell>
                <TableCell sx={{ width: '19%' }}>Next Planned Run</TableCell>
                <TableCell sx={{ width: '10%' }}>Status</TableCell>
                {canManage && <TableCell align="right" sx={{ width: '10%' }}>Actions</TableCell>}
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
                  <TableCell sx={{ wordBreak: 'break-all' }}>
                    {component.currentImageTag ? (
                      <code>{component.imageRepository}:{component.currentImageTag}</code>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={describeMode(s.mode)} sx={{ maxWidth: 'none' }} />
                  </TableCell>
                  <TableCell>{describeNextRun(s)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.enabled ? 'Active' : 'Paused'} color={s.enabled ? 'success' : 'default'} />
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
        Rebase Runs
      </Typography>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '50%' }}>Run Id</TableCell>
              <TableCell sx={{ width: '12%' }}>Trigger</TableCell>
              <TableCell sx={{ width: '19%' }}>Started</TableCell>
              <TableCell sx={{ width: '11%' }}>Status</TableCell>
              <TableCell align="right" sx={{ width: '8%' }}>Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rebaseRuns.pageItems.map((run) => (
              <TableRow key={run.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(runUrl(run))}>
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.label}</TableCell>
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
            {rebaseRuns.total === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary" align="center">
                    No rebase runs yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <PaginationFooter
          page={rebaseRuns.page}
          pageCount={rebaseRuns.pageCount}
          total={rebaseRuns.total}
          limit={rebaseRuns.limit}
          start={rebaseRuns.start}
          onChange={rebaseRuns.setPage}
        />
      </Card>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Repave Runs
      </Typography>
      <Card variant="outlined">
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '35%' }}>Run Id</TableCell>
              <TableCell sx={{ width: '15%' }}>Environments</TableCell>
              <TableCell sx={{ width: '12%' }}>Trigger</TableCell>
              <TableCell sx={{ width: '19%' }}>Started</TableCell>
              <TableCell sx={{ width: '11%' }}>Status</TableCell>
              <TableCell align="right" sx={{ width: '8%' }}>Open</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repaveRuns.pageItems.map((run) => (
              <TableRow key={run.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(runUrl(run))}>
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.label}</TableCell>
                <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {run.environments?.map(capitalize).join(', ') ?? '—'}
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
            {repaveRuns.total === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" align="center">
                    No repave runs yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <PaginationFooter
          page={repaveRuns.page}
          pageCount={repaveRuns.pageCount}
          total={repaveRuns.total}
          limit={repaveRuns.limit}
          start={repaveRuns.start}
          onChange={repaveRuns.setPage}
        />
      </Card>

      <ScheduleFormDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        canTargetProduction={canProd}
      />
    </Box>
  );
}
