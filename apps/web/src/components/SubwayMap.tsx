import { Box, Typography, Tooltip, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import type { PipelineStep, StepStatus } from '@lob/shared';

const statusColor: Record<StepStatus, string> = {
  success: '#16a34a',
  failed: '#dc2626',
  running: '#2563eb',
  pending: '#94a3b8',
  skipped: '#cbd5e1',
};

const statusIcon = (status: StepStatus) => {
  const sx = { fontSize: 28, color: statusColor[status] };
  switch (status) {
    case 'success':
      return <CheckCircleIcon sx={sx} />;
    case 'failed':
      return <ErrorIcon sx={sx} />;
    case 'running':
      return <HourglassEmptyIcon sx={{ ...sx, animation: 'spin 1.2s linear infinite' }} />;
    default:
      return <RadioButtonUncheckedIcon sx={sx} />;
  }
};

function formatDuration(ms?: number) {
  if (!ms) return '\u2014';
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

interface Props {
  steps: PipelineStep[];
}

export function SubwayMap({ steps }: Props) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);

  return (
    <Box sx={{ overflowX: 'auto', py: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          minWidth: sorted.length * 140,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 22,
            left: 40,
            right: 40,
            height: 4,
            bgcolor: 'grey.300',
            zIndex: 0,
          }}
        />

        {sorted.map((step, idx) => (
          <Box
            key={step.id}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
              px: 1,
            }}
          >
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {step.name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Status: {step.status}
                  </Typography>
                  {step.startTime && (
                    <Typography variant="caption" display="block">
                      Start: {new Date(step.startTime).toLocaleString()}
                    </Typography>
                  )}
                  {step.endTime && (
                    <Typography variant="caption" display="block">
                      End: {new Date(step.endTime).toLocaleString()}
                    </Typography>
                  )}
                  {step.message && (
                    <Typography variant="caption" display="block" color="error.light">
                      {step.message}
                    </Typography>
                  )}
                </Box>
              }
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  border: '3px solid',
                  borderColor: statusColor[step.status],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: step.status === 'running' ? `0 0 0 4px ${statusColor.running}33` : undefined,
                }}
              >
                {statusIcon(step.status)}
              </Box>
            </Tooltip>

            <Typography
              variant="body2"
              fontWeight={600}
              textAlign="center"
              sx={{ mt: 1.5, maxWidth: 120 }}
            >
              {step.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatDuration(step.durationMs)}
            </Typography>

            {step.status === 'failed' && (
              <Chip label="Failed" size="small" color="error" sx={{ mt: 0.5 }} />
            )}
            {step.status === 'running' && (
              <Chip label="Running" size="small" color="primary" sx={{ mt: 0.5 }} />
            )}

            {idx < sorted.length - 1 && null}
          </Box>
        ))}
      </Box>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
