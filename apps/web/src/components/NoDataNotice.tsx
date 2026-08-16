import { Box, Typography } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';

interface Props {
  label: string;
}

/** Shown wherever a page previously fetched data from the (now removed) BFF. */
export function NoDataNotice({ label }: Props) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <CloudOffIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
      <Typography color="text.secondary">
        No backend connected — {label} will appear here once one is wired up.
      </Typography>
    </Box>
  );
}
