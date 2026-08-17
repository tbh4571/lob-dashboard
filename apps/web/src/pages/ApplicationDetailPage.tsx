import { useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Chip,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { componentUrl, getApplicationBySlug, listComponentsByApplication, runUrl } from '../lib/mockData';
import { useDataStore, type ScheduleFormInput } from '../lib/store';
import { usePersona } from '../lib/persona';
import { describeNextRun, describeSchedule } from '../lib/scheduleFormat';
import { ScheduleFormDialog } from '../components/ScheduleFormDialog';
import type { Component, Schedule } from '../types';

export function ApplicationDetailPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { listSchedulesByComponent, updateSchedule, toggleSchedule, triggerRebase } = useDataStore();
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const app = appSlug ? getApplicationBySlug(appSlug) : undefined;
  const components = app ? listComponentsByApplication(app.id) : [];

  const canManage = persona.role === 'developer' || persona.role === 'operations';
  const canProd = persona.role === 'operations';

  if (!app) {
    return <Typography>Application not found</Typography>;
  }

  const handleRebase = (component: Component) => {
    const run = triggerRebase(component.id, persona.id);
    navigate(runUrl(run));
  };

  const openEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  };

  const handleSaveSchedule = (input: ScheduleFormInput) => {
    if (editingSchedule) updateSchedule(editingSchedule.id, input);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/applications" underline="hover" color="inherit">
          Applications
        </Link>
        <Typography color="text.primary">{app.name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {app.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {app.description}
      </Typography>
      {app.owner && <Chip size="small" label={`Owner: ${app.owner}`} sx={{ mb: 3 }} />}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Components
      </Typography>

      {components.length > 0 ? (
        <Card variant="outlined">
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '20%' }}>Component Name</TableCell>
                <TableCell sx={{ width: '25%' }}>Schedule</TableCell>
                <TableCell sx={{ width: '20%' }}>Next Planned Run</TableCell>
                <TableCell sx={{ width: '13%' }}>Status</TableCell>
                <TableCell align="right" sx={{ width: '22%' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components.map((comp) => {
                const schedule = listSchedulesByComponent(comp.id)[0];
                return (
                  <TableRow
                    key={comp.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(componentUrl(comp.id))}
                  >
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={componentUrl(comp.id)}
                        underline="hover"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {comp.name}
                      </Link>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {comp.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {schedule ? (
                        <Typography variant="body2">{describeSchedule(schedule)}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No schedule
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{schedule ? describeNextRun(schedule) : '—'}</TableCell>
                    <TableCell>
                      {schedule && (
                        <Chip
                          size="small"
                          label={schedule.enabled ? 'Active' : 'Paused'}
                          color={schedule.enabled ? 'success' : 'default'}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {canManage && (
                        <>
                          <Tooltip title="Rebase">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRebase(comp);
                              }}
                            >
                              <BuildIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {schedule && (
                            <>
                              <Tooltip title="Edit schedule">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditSchedule(schedule);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={schedule.enabled ? 'Pause schedule' : 'Resume schedule'}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSchedule(schedule.id);
                                  }}
                                >
                                  {schedule.enabled ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary">No components for this application yet.</Typography>
      )}

      <ScheduleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
        canTargetProduction={canProd}
      />
    </Box>
  );
}
