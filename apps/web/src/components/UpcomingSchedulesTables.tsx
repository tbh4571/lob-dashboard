import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow, Link } from '@mui/material';
import type { Component, Schedule } from '../types';
import { componentUrl } from '../lib/mockData';
import { capitalize } from '../lib/status';
import { describeMode, describeNextRun } from '../lib/scheduleFormat';
import { computeUpcomingRebases, computeUpcomingRepaves } from '../lib/upcomingSchedules';

interface Props {
  schedules: Schedule[];
  components: Component[];
}

/** "What's about to run" visibility — rendered identically across all three
 * persona dashboards so everyone sees the same near-term schedule, distinct
 * from Active Schedules / My Schedules which list everything regardless of timing. */
export function UpcomingSchedulesTables({ schedules, components }: Props) {
  const upcomingRebases = computeUpcomingRebases(schedules, components);
  const upcomingRepaves = computeUpcomingRepaves(schedules, components);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Upcoming Rebases (Next 7 Days)
      </Typography>
      {upcomingRebases.length > 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Next Run</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingRebases.map(({ schedule, component }) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={componentUrl(component.id)} underline="hover">
                      {component.name}
                    </Link>
                  </TableCell>
                  <TableCell>{describeMode(schedule.mode)}</TableCell>
                  <TableCell>{describeNextRun(schedule)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          No rebases scheduled in the next 7 days.
        </Typography>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        Upcoming Repaves (Next 7 Days)
      </Typography>
      {upcomingRepaves.length > 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Component</TableCell>
                <TableCell>Environments</TableCell>
                <TableCell>Next Run</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingRepaves.map(({ schedule, component }) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={componentUrl(component.id)} underline="hover">
                      {component.name}
                    </Link>
                  </TableCell>
                  <TableCell>{schedule.environments.map(capitalize).join(', ') || '—'}</TableCell>
                  <TableCell>{describeNextRun(schedule)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          No repaves scheduled in the next 7 days.
        </Typography>
      )}
    </Box>
  );
}
