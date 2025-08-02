import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
    Box,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Typography,
    Divider,
    Chip,
    useMediaQuery,
    Theme,
    Snackbar
} from "@mui/material";
import { Settings as SettingsIcon, Save as SaveIcon, Apps as AppsIcon } from "@mui/icons-material";
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
                <DialogTitle>Settings</DialogTitle>
                <Divider />
                <DialogContent sx={{ p: isMobileLandscape ? 1 : 2, pb: isMobileLandscape ? 0 : 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                            )}

                            <Box>
                                {/* Simple header for desktop */}
                                {!isMobileLandscape && (
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                                            Application Whitelist
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Select which applications appear in the volume control
                                        </Typography>
                                        {whitelistedApps.length > 0 && (
                                            <Chip
                                                label={`${whitelistedApps.length} apps selected`}
                                                color="primary"
                                                sx={{ mt: 1 }}
                                            />
                                        )}
                                    </Box>
                                )}

                                {/* Mobile landscape layout */}
                                {isMobileLandscape ? (
                                    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 140px)' }}>
                                        {/* Left Column - Header and Selected Count */}
                                        <Box sx={{
                                            flex: '0 0 200px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            pr: 2,
                                            borderRight: 1,
                                            borderColor: 'divider'
                                        }}>
                                            <Stack direction="column" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 2,
                                                        bgcolor: mode === 'dark' ? 'primary.dark' : 'primary.light',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <AppsIcon sx={{ color: mode === 'dark' ? 'primary.contrastText' : 'primary.main' }} />
                                                </Box>
                                                <Typography variant="h6" fontWeight="bold">
                                                    Choose Your Apps
                                                </Typography>
                                            </Stack>

                                            {whitelistedApps.length > 0 && (
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        bgcolor: mode === 'dark' ? 'grey.900' : 'grey.100',
                                                        textAlign: 'center',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                                        {whitelistedApps.length}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        apps selected
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                                                Tap apps to show/hide them from volume control
                                            </Typography>
                                        </Box>

                                        {/* Right Column - App List */}
                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <SimpleWhitelist
                                                processes={processes}
                                                selectedProcesses={whitelistedApps}
                                                onToggleProcess={handleToggleProcess}
                                                loading={loadingProcesses}
                                                mode={mode}
                                            />
                                        </Box>
                                    </Box>
                                ) : (
                                    /* Desktop layout - simple */
                                    <SimpleWhitelist
                                        processes={processes}
                                        selectedProcesses={whitelistedApps}
                                        onToggleProcess={handleToggleProcess}
                                        loading={loadingProcesses}
                                        mode={mode}
                                    />
                                )}
                            </Box>

                            {!isMobileLandscape && (
                                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
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
                                </Stack>
                            )}
                        </>
                    )}
                </DialogContent>
                {isMobileLandscape && !loading && (
                    <DialogActions sx={{ px: 2, py: 1 }}>
                        <Button onClick={handleClose} size="small">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            size="small"
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