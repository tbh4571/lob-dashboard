import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActionArea, Grid, Skeleton, Chip, Stack } from '@mui/material';
import { trpc } from '../lib/trpc';
import { envStatusColor, envStatusLabel } from '../lib/status';

export function ComponentsPage() {
  const { data: components, isLoading: componentsLoading } = trpc.components.list.useQuery();
  const { data: applications, isLoading: appsLoading } = trpc.applications.list.useQuery();

  const isLoading = componentsLoading || appsLoading;
  const appName = (applicationId: string) =>
    applications?.find((a) => a.id === applicationId)?.name ?? applicationId;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Components
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Deployable components across all applications
      </Typography>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={180} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {components?.map((comp) => (
            <Grid key={comp.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea component={RouterLink} to={`/components/${comp.id}`} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {comp.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appName(comp.applicationId)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {comp.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(['nonprod', 'preprod', 'production'] as const).map((env) => {
                          const status = comp.environments[env];
                          return (
                            <Chip
                              key={env}
                              size="small"
                              label={`${env}: ${envStatusLabel(status?.status)}`}
                              color={envStatusColor(status?.status)}
                              variant="outlined"
                            />
                          );
                        })}
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          {components?.length === 0 && (
            <Grid size={12}>
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No components yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
