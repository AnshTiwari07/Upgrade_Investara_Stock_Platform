import React, { useContext } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  Switch, 
  Slider, 
  Stack, 
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { AudioContext } from '../context/AudioContext';

const TradingSettings = ({ open, onClose }) => {
  const { 
    audioSettings, 
    toggleAudio, 
    updateVolume, 
    playBuySound, 
    playSellSound 
  } = useContext(AudioContext);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: 400
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Terminal Settings</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'grey.500' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Audio Notifications</Typography>
              <Switch 
                checked={audioSettings.enabled} 
                onChange={toggleAudio} 
                color="primary"
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Play sounds for successful buy and sell transactions.
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box sx={{ opacity: audioSettings.enabled ? 1 : 0.5, pointerEvents: audioSettings.enabled ? 'auto' : 'none' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              {audioSettings.volume > 0 ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
              Notification Volume
            </Typography>
            <Slider
              value={audioSettings.volume}
              min={0}
              max={1}
              step={0.1}
              onChange={(e, val) => updateVolume(val)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
            />
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Preview Sounds</Typography>
            <Stack direction="row" spacing={2}>
              <Box 
                onClick={playBuySound}
                sx={{ 
                  flex: 1, 
                  p: 2, 
                  bgcolor: 'rgba(76, 175, 80, 0.1)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.2)' }
                }}
              >
                <Typography variant="caption" sx={{ color: 'success.light', fontWeight: 800, display: 'block' }}>BUY CHIME</Typography>
                <PlayArrowIcon sx={{ color: 'success.main', mt: 1 }} />
              </Box>
              <Box 
                onClick={playSellSound}
                sx={{ 
                  flex: 1, 
                  p: 2, 
                  bgcolor: 'rgba(244, 67, 54, 0.1)', 
                  borderRadius: 2, 
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                }}
              >
                <Typography variant="caption" sx={{ color: 'error.light', fontWeight: 800, display: 'block' }}>SELL CHIME</Typography>
                <PlayArrowIcon sx={{ color: 'error.main', mt: 1 }} />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TradingSettings;
