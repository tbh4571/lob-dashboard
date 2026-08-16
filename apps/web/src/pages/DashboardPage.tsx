import { Box, Typography } from '@mui/material';
import { NoDataNotice } from '../components/NoDataNotice';

export function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Welcome
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Line of Business applications, components, and pipeline visibility
      </Typography>

      <NoDataNotice label="pipeline activity" />
    </Box>
  );
}
