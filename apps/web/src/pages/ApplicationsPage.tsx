import { Box, Typography } from '@mui/material';
import { NoDataNotice } from '../components/NoDataNotice';

export function ApplicationsPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Applications
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Line of business applications and their deployable components
      </Typography>

      <NoDataNotice label="applications" />
    </Box>
  );
}
