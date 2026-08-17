import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Chip,
  Stack,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { applicationUrl, componentUrl, listApplications, getApplicationById, getComponentById } from '../lib/mockData';
import { useDataStore, type ScheduleFormInput } from '../lib/store';
import { usePersona } from '../lib/persona';
import { cronExpression, describeMode, describeNextRun, describeSchedule } from '../lib/scheduleFormat';
import { ScheduleFormDialog } from '../components/ScheduleFormDialog';
import { PaginationFooter } from '../components/PaginationFooter';
import { usePagination } from '../lib/usePagination';
import type { Schedule } from '../types';

type StatusFilter = 'all' | 'active' | 'paused';

export function SchedulesPage() {
  const { persona } = usePersona();
  const { schedules, updateSchedule, toggleSchedule } = useDataStore();
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canManage = persona.role === 'developer' || persona.role === 'operations';
  const canProd = persona.role === 'operations';
  const applications = listApplications();

  const rows = schedules
    .map((s) => {
      const component = getComponentById(s.componentId);
      const application = component ? getApplicationById(component.applicationId) : undefined;
      return { schedule: s, component, application };
    })
    .filter((r) => r.component && r.application)
    .filter((r) => applicationFilter === 'all' || r.application!.id === applicationFilter)
    .filter((r) => {
      if (statusFilter === 'all') return true;
      return statusFilter === 'active' ? r.schedule.enabled : !r.schedule.enabled;
    })
    .sort((a, b) => a.application!.name.localeCompare(b.application!.name) || a.component!.name.localeCompare(b.component!.name));

  const { page, setPage, pageCount, start, total, limit, pageItems } = usePagination(rows, 10);

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
        Schedules
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Every configured Rebase / Repave schedule across all applications
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Application"
          value={applicationFilter}
          onChange={(e) => {
            setApplicationFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="all">All applications</MenuItem>
          {applications.map((app) => (
            <MenuItem key={app.id} value={app.id}>
              {app.name}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={statusFilter}
          onChange={(_, v) => {
            if (v) {
              setStatusFilter(v);
              setPage(0);
            }
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="paused">Paused</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Card variant="outlined">
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '12%' }}>Application</TableCell>
              <TableCell sx={{ width: '12%' }}>Component</TableCell>
              <TableCell sx={{ width: '14%' }}>Schedule</TableCell>
              <TableCell sx={{ width: '23%' }}>Mode</TableCell>
              <TableCell sx={{ width: '19%' }}>Next Planned Run</TableCell>
              <TableCell sx={{ width: '10%' }}>Status</TableCell>
              {canManage && <TableCell align="right" sx={{ width: '10%' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageItems.map(({ schedule: s, component, application }) => (
              <TableRow key={s.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={applicationUrl(application!.id)} underline="hover">
                    {application!.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link component={RouterLink} to={componentUrl(component!.id)} underline="hover">
                    {component!.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{describeSchedule(s)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    <code>{cronExpression(s)}</code>
                    {s.frequency === 'biweekly' && ' · every 2 weeks'}
                  </Typography>
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
            {total === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary" align="center">
                    No schedules match the current filters.
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
