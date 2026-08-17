import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Chip,
  Link,
  TextField,
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
import { applicationUrl, componentUrl, listComponents, getApplicationById, runUrl } from '../lib/mockData';
import { useDataStore, type ScheduleFormInput } from '../lib/store';
import { usePersona } from '../lib/persona';
import { describeNextRun, describeSchedule } from '../lib/scheduleFormat';
import { ScheduleFormDialog } from '../components/ScheduleFormDialog';
import { PaginationFooter } from '../components/PaginationFooter';
import { usePagination } from '../lib/usePagination';
import type { Component, Schedule } from '../types';

export function ComponentsPage() {
  const navigate = useNavigate();
  const { persona } = usePersona();
  const { listSchedulesByComponent, updateSchedule, toggleSchedule, triggerRebase } = useDataStore();
  const [search, setSearch] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canManage = persona.role === 'developer' || persona.role === 'operations';
  const canProd = persona.role === 'operations';

  const query = search.trim().toLowerCase();
  const filtered = listComponents().filter((c) => !query || c.name.toLowerCase().includes(query));
  const { page, setPage, pageCount, start, total, limit, pageItems } = usePagination(filtered, 10);

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
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Components
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Every deployable component across all applications
      </Typography>

      <TextField
        size="small"
        placeholder="Search components…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        sx={{ mb: 3, maxWidth: 320 }}
      />

      <Card variant="outlined">
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '14%' }}>Application</TableCell>
              <TableCell sx={{ width: '16%' }}>Component</TableCell>
              <TableCell sx={{ width: '20%' }}>Schedule</TableCell>
              <TableCell sx={{ width: '18%' }}>Next Planned Run</TableCell>
              <TableCell sx={{ width: '10%' }}>Status</TableCell>
              <TableCell align="right" sx={{ width: '22%' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map((comp) => {
              const app = getApplicationById(comp.applicationId);
              const schedule = listSchedulesByComponent(comp.id)[0];
              return (
                <TableRow key={comp.id} hover>
                  <TableCell>
                    {app && (
                      <Link component={RouterLink} to={applicationUrl(app.id)} underline="hover">
                        {app.name}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link component={RouterLink} to={componentUrl(comp.id)} underline="hover">
                      {comp.name}
                    </Link>
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
                          <IconButton size="small" onClick={() => handleRebase(comp)}>
                            <BuildIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {schedule && (
                          <>
                            <Tooltip title="Edit schedule">
                              <IconButton size="small" onClick={() => openEditSchedule(schedule)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={schedule.enabled ? 'Pause schedule' : 'Resume schedule'}>
                              <IconButton size="small" onClick={() => toggleSchedule(schedule.id)}>
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
            {total === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" align="center">
                    No components match your search.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <PaginationFooter page={page} pageCount={pageCount} total={total} limit={limit} start={start} onChange={setPage} />
      </Card>

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
