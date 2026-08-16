import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Stack,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import type { Environment, Schedule } from '../types';
import type { ScheduleFormInput } from '../lib/store';
import { DAY_OPTIONS, HOUR_OPTIONS } from '../lib/scheduleFormat';

const ENVS: Environment[] = ['nonprod', 'preprod', 'production'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (input: ScheduleFormInput) => void;
  schedule?: Schedule;
  canTargetProduction: boolean;
}

function defaultInput(schedule: Schedule | undefined): ScheduleFormInput {
  if (schedule) {
    return {
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek,
      hour: schedule.hour,
      mode: schedule.mode,
      environments: schedule.environments,
    };
  }
  return {
    frequency: 'weekly',
    dayOfWeek: 1,
    hour: 2,
    mode: 'automated',
    environments: ['nonprod'],
  };
}

export function ScheduleFormDialog({ open, onClose, onSave, schedule, canTargetProduction }: Props) {
  const [input, setInput] = useState<ScheduleFormInput>(() => defaultInput(schedule));

  useEffect(() => {
    if (open) setInput(defaultInput(schedule));
  }, [open, schedule]);

  const toggleEnv = (env: Environment) => {
    setInput((prev) => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter((e) => e !== env)
        : [...prev.environments, env],
    }));
  };

  const canSave = input.mode === 'manual' || input.environments.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{schedule ? 'Edit schedule' : 'New schedule'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Mode
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={input.mode}
              onChange={(_, v) => v && setInput((prev) => ({ ...prev, mode: v }))}
              size="small"
              fullWidth
            >
              <ToggleButton value="automated">Automated</ToggleButton>
              <ToggleButton value="manual">Manual</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" color="text.secondary">
              {input.mode === 'automated' ? 'Runs Rebase, then Repave to the selected environments.' : 'Runs Rebase only.'}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Frequency
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={input.frequency}
              onChange={(_, v) => v && setInput((prev) => ({ ...prev, frequency: v }))}
              size="small"
              fullWidth
            >
              <ToggleButton value="weekly">Weekly</ToggleButton>
              <ToggleButton value="biweekly">Bi-weekly</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Day"
              value={input.dayOfWeek}
              onChange={(e) => setInput((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
              fullWidth
            >
              {DAY_OPTIONS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Time"
              value={input.hour}
              onChange={(e) => setInput((prev) => ({ ...prev, hour: Number(e.target.value) }))}
              fullWidth
            >
              {HOUR_OPTIONS.map((h) => (
                <MenuItem key={h.value} value={h.value}>
                  {h.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {input.mode === 'automated' && (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Repave target environments
              </Typography>
              <FormGroup>
                {ENVS.map((env) => (
                  <FormControlLabel
                    key={env}
                    control={
                      <Checkbox
                        checked={input.environments.includes(env)}
                        onChange={() => toggleEnv(env)}
                        disabled={env === 'production' && !canTargetProduction}
                      />
                    }
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span style={{ textTransform: 'capitalize' }}>{env}</span>
                        {env === 'production' && !canTargetProduction && (
                          <Chip size="small" label="Ops only" color="warning" />
                        )}
                      </Stack>
                    }
                  />
                ))}
              </FormGroup>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave} onClick={() => onSave(input)}>
          {schedule ? 'Save changes' : 'Create schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
