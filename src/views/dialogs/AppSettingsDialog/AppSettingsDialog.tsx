import { menuSettingsDialog } from '@genaism/state/menuState';
import { appConfiguration } from '@genaism/state/settingsState';
import { Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import CloseIcon from '@mui/icons-material/Close';
import Feed from '@genaism/components/Feed/Feed';
import AppNavigation from '@genaism/views/Genagram/AppNavigation';

export default function AppSettingsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuSettingsDialog);
    const [config, setConfig] = useRecoilState(appConfiguration);

    const doClose = useCallback(() => setShowDialog('none'), [setShowDialog]);

    return (
        <Dialog
            open={showDialog === 'app'}
            onClose={doClose}
            scroll="paper"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{t('settings.titles.app')}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={doClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ display: 'flex', padding: 0, maxHeight: '600px' }}>
                <div className={style.feedView}>
                    <Feed alwaysActive />
                    {!config.hideActionsButton && <AppNavigation code="x" />}
                </div>
                <div className={style.column}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hideActionsButton || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, hideActionsButton: checked }))}
                            />
                        }
                        label={t('settings.app.hideFeedMenu')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hideDataView || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, hideDataView: checked }))}
                            />
                        }
                        label={t('settings.app.hideDataView')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hideProfileView || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, hideProfileView: checked }))}
                            />
                        }
                        label={t('settings.app.hideProfileView')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hideRecommendationsView || false}
                                onChange={(_, checked) =>
                                    setConfig((old) => ({ ...old, hideRecommendationsView: checked }))
                                }
                            />
                        }
                        label={t('settings.app.hideRecommendationsView')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hidePostContent || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, hidePostContent: checked }))}
                            />
                        }
                        label={t('settings.app.hidePostContent')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hideOwnProfile || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, hideOwnProfile: checked }))}
                            />
                        }
                        label={t('settings.app.hideOwnProfile')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.hideShareProfile || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, hideShareProfile: checked }))}
                            />
                        }
                        label={t('settings.app.hideSharing')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={config?.showTopicLabels || false}
                                onChange={(_, checked) => setConfig((old) => ({ ...old, showTopicLabels: checked }))}
                            />
                        }
                        label={t('settings.app.showFeedImageLabels')}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
