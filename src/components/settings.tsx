import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton,
  TextField,
  Box,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Typography,
  Divider
} from "@mui/material";
import { Settings as SettingsIcon, Save as SaveIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useSettings } from "@/app/hooks/useSettings";

const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, loading, saving, error, updateSetting } = useSettings();
  const [name, setName] = useState(settings.name);

  // Update local state when settings load
  useEffect(() => {
    setName(settings.name);
  }, [settings.name]);

  const handleSave = async () => {
    await updateSetting('name', name);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset to saved value on close without saving
    setName(settings.name);
  };

  if (!isOpen) {
    return (
      <IconButton 
        sx={{ mr: 0 }} 
        onClick={() => setIsOpen(true)}
      >
        <SettingsIcon />
      </IconButton>
    );
  }

  return (
    <Dialog 
      open={true} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <Divider />
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Display Name
              </Typography>
              <TextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                helperText="This name will be displayed in the app"
              />
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || name === settings.name}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Settings;