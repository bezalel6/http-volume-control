import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Typography,
    Divider,
    Chip
} from "@mui/material";
import { Settings as SettingsIcon, Save as SaveIcon, Apps as AppsIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useSettings } from "@/app/hooks/useSettings";
import ProcessScroller from "@/components/ProcessScroller";
import { getAllProcesses } from "@/app/actions/audio";
import { AudioProcess } from "@/types/audio";

interface SettingsProps {
    onSettingsChange?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSettingsChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, loading, saving, error, updateSetting } = useSettings();
    const [whitelistedApps, setWhitelistedApps] = useState<string[]>(settings.whitelistedApps || []);
    const [processes, setProcesses] = useState<AudioProcess[]>([]);
    const [loadingProcesses, setLoadingProcesses] = useState(false);

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
        await updateSetting('whitelistedApps', whitelistedApps);
        if (onSettingsChange) {
            onSettingsChange();
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
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <AppsIcon />
                                    <Typography variant="h6">
                                        Application Whitelist
                                    </Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Select which applications should appear in the volume control.
                                    {whitelistedApps.length === 0 && " When no apps are selected, all applications will be shown."}
                                </Typography>

                                {whitelistedApps.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Selected Applications ({whitelistedApps.length})
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {whitelistedApps.map(processPath => {
                                                const process = processes.find(p => p.processPath === processPath);
                                                return (
                                                    <Chip
                                                        key={processPath}
                                                        label={process?.name || processPath.split('\\').pop()}
                                                        size="small"
                                                        onDelete={() => handleToggleProcess(processPath)}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}

                                <Box sx={{
                                    bgcolor: 'background.default',
                                    borderRadius: 2,
                                    p: 2,
                                    border: 1,
                                    borderColor: 'divider'
                                }}>
                                    <ProcessScroller
                                        processes={processes}
                                        selectedProcesses={whitelistedApps}
                                        onToggleProcess={handleToggleProcess}
                                        loading={loadingProcesses}
                                    />
                                </Box>
                            </Box>

                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving || JSON.stringify(whitelistedApps) === JSON.stringify(settings.whitelistedApps || [])}
                                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog></>
    );
};

export default Settings;