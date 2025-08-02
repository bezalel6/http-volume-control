'use client';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
    Box,
    Button,
    CircularProgress,
    Alert,
    Typography,
    useMediaQuery,
    Theme,
    Snackbar,
    Fade
} from "@mui/material";
import {
    Settings as SettingsIcon,
    Save as SaveIcon
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useSettings } from "@/app/hooks/useSettings";
import SimpleWhitelist from "@/components/SimpleWhitelist";
import { getAllProcesses } from "@/app/actions/audio";
import { AudioProcess } from "@/types/audio";
import { useTheme } from '@/components/ThemeProvider';

interface SettingsProps {
    onSettingsChange?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { mode } = useTheme();
    const { settings, loading, saving, error, updateSetting } = useSettings();
    const [whitelistedApps, setWhitelistedApps] = useState<string[]>(settings.whitelistedApps || []);
    const [processes, setProcesses] = useState<AudioProcess[]>([]);
    const [loadingProcesses, setLoadingProcesses] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Detect mobile landscape orientation
    const isMobileLandscape = useMediaQuery((theme: Theme) =>
        `${theme.breakpoints.down('sm')} and (orientation: landscape)`
    );
    // Update local state when settings load
    useEffect(() => {
        setWhitelistedApps(settings.whitelistedApps || []);
    }, [settings.whitelistedApps]);

    // Load processes when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadProcesses();
        }
    }, [isOpen]);

    const loadProcesses = async () => {
        setLoadingProcesses(true);
        const result = await getAllProcesses();
        if (result.success) {
            setProcesses(result.data);
        }
        setLoadingProcesses(false);
    };

    const handleToggleProcess = (processPath: string) => {
        setWhitelistedApps(prev => {
            if (prev.includes(processPath)) {
                return prev.filter(p => p !== processPath);
            } else {
                return [...prev, processPath];
            }
        });
    };

    const handleSave = async () => {
        const success = await updateSetting('whitelistedApps', whitelistedApps);
        if (success) {
            setSuccessMessage('Settings saved successfully');
            setIsOpen(false);
            if (onSettingsChange) {
                onSettingsChange();
            }
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset to saved value on close without saving
        setWhitelistedApps(settings.whitelistedApps || []);
    };


    return (
        <><IconButton
            sx={{ mr: 0 }}
            onClick={() => setIsOpen(true)}
        >
            <SettingsIcon />
        </IconButton>
            <Dialog
                open={isOpen}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth={false}
                fullScreen={isMobileLandscape}
                sx={{
                    '& .MuiDialog-paper': {
                        width: isMobileLandscape ? '100%' : '500px',
                        maxHeight: isMobileLandscape ? '100%' : '600px',
                    }
                }}
            >
                <DialogTitle>
                    Choose Apps to Control
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                            )}

                            {loadingProcesses ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                    <CircularProgress />
                                </Box>
                            ) : processes.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography color="text.secondary">
                                        No applications found
                                    </Typography>
                                </Box>
                            ) : (
                                <Fade in={!loadingProcesses}>
                                    <Box>
                                        <SimpleWhitelist
                                            processes={processes}
                                            selectedProcesses={whitelistedApps}
                                            onToggleProcess={handleToggleProcess}
                                            loading={loadingProcesses}
                                            mode={mode}
                                        />
                                    </Box>
                                </Fade>
                            )}
                        </>
                    )}
                </DialogContent>
                {!loading && (
                    <DialogActions>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving || JSON.stringify(whitelistedApps) === JSON.stringify(settings.whitelistedApps || [])}
                            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            {/* Success Toast */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar></>
    );
};

export default Settings;