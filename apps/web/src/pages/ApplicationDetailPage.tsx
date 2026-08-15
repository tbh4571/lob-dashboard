import { Link as RouterLink, useParams } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
} from '@mui/material';
import { trpc } from '../lib/trpc';

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isLoading: appLoading } = trpc.applications.byId.useQuery(
    { id: id! },
    { enabled: !!id },
  );
  const { data: components, isLoading: compsLoading } = trpc.applications.components.useQuery(
    { applicationId: id! },
    { enabled: !!id },
  );

  if (appLoading || compsLoading) {
    return (
      <Box>
        <Skeleton width={200} height={40} />
        <Skeleton height={120} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!app) {
    return <Typography>Application not found</Typography>;
  }

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

      <Grid container spacing={2}>
        {components?.map((comp) => (
          <Grid key={comp.id} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardActionArea component={RouterLink} to={`/components/${comp.id}`}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {comp.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {comp.description}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(['nonprod', 'preprod', 'production'] as const).map((env) => {
                      const status = comp.environments[env];
                      return (
                        <Chip
                          key={env}
                          size="small"
                          label={`${env}: ${status?.status ?? 'n/a'}`}
                          color={
                            status?.status === 'healthy'
                              ? 'success'
                              : status?.status === 'degraded'
                                ? 'warning'
                                : 'default'
                          }
                          variant="outlined"
                        />
                      );
                    })}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
