import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Skeleton,
  Chip,
  Stack,
} from '@mui/material';
import { trpc } from '../lib/trpc';

export function ApplicationsPage() {
  const { data: apps, isLoading } = trpc.applications.list.useQuery();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Applications
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Line of business applications and their deployable components
      </Typography>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {apps?.map((app) => (
            <Grid key={app.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea component={RouterLink} to={`/applications/${app.id}`} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight={600}>
                        {app.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {app.description}
                      </Typography>
                      {app.owner && <Chip size="small" label={app.owner} variant="outlined" sx={{ alignSelf: 'flex-start' }} />}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
