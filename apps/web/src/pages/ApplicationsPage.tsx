import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActionArea, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { listApplications, listComponentsByApplication } from '../lib/mockData';
import { useDataStore } from '../lib/store';

export function ApplicationsPage() {
  const apps = listApplications();
  const { schedules } = useDataStore();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Applications
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Line of business applications and their deployable components
      </Typography>

      <Grid container spacing={2}>
        {apps.map((app) => {
          const components = listComponentsByApplication(app.id);
          const componentIds = new Set(components.map((c) => c.id));
          const scheduleCount = schedules.filter((s) => componentIds.has(s.componentId)).length;

          return (
            <Grid key={app.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea component={RouterLink} to={`/applications/${app.id}`} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {app.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {app.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {app.owner && <Chip size="small" label={app.owner} variant="outlined" />}
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<WidgetsIcon fontSize="small" />}
                        label={`${components.length} component${components.length === 1 ? '' : 's'}`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<ScheduleIcon fontSize="small" />}
                        label={`${scheduleCount} schedule${scheduleCount === 1 ? '' : 's'} configured`}
                      />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
