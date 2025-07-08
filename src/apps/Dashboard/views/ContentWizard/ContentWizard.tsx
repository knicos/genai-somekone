import style from './style.module.css';
import QueryGenerator from './QueryGenerator';
import { useCallback, useEffect, useRef, useState } from 'react';
import ContentSummary from './ContentSummary';
import BlockIcon from '@mui/icons-material/Block';
import EmbeddingTool from './Embedding/EmbeddingTool';
import { IconMenu, IconMenuItem } from '@genaism/common/components/IconMenu';
import { IconButton } from '@mui/material';
import { useServices } from '@genaism/hooks/services';
import ContentClustering from './Cluster/ContentClustering';
import { I18nextProvider, useTranslation } from 'react-i18next';
import SvgLayer, { ILine } from '@genaism/common/components/WorkflowLayout/SvgLayer';
import { extractNodesFromElements, generateLines, IConnection } from '@genaism/common/components/WorkflowLayout/lines';
import MappingTool from './MappingEncoder';
import ContentBrowserWidget from './Browser/ContentBrowserWidget';
import DownloadIcon from '@mui/icons-material/Download';
import { saveFile } from '@genaism/services/saver/fileSaver';
import { useSettingSerialise } from '@genaism/hooks/settings';
import { useSetAtom } from 'jotai';
import { errorNotification } from '@genaism/common/state/errorState';
import i18n from '@genaism/i18n';
import { canvasFromURL } from '@genai-fi/base';
import SettingsIcon from '@mui/icons-material/Settings';
import ContentSettingsDialog from './SettingsDialog';

const connections: IConnection[] = [
    { start: 'query', end: 'summary', startPoint: 'right', endPoint: 'left' },
    { start: 'summary', end: 'embed', startPoint: 'right', endPoint: 'left' },
    { start: 'embed', end: 'cluster', startPoint: 'right', endPoint: 'left' },
    { start: 'cluster', end: 'mapping', startPoint: 'right', endPoint: 'left' },
    { start: 'embed', end: 'similarity', startPoint: 'bottom', endPoint: 'top' },
    { start: 'mapping', end: 'points', startPoint: 'bottom', endPoint: 'top' },
    { start: 'cluster', end: 'clusterinstance', startPoint: 'bottom', endPoint: 'top' },
    { start: 'mapping', end: 'browser', startPoint: 'right', endPoint: 'left' },
    { start: 'browser', end: 'image', startPoint: 'bottom', endPoint: 'top' },
];

export default function ContentWizard() {
    const { t } = useTranslation(['tools']);
    const { content: contentSvc, profiler: profilerSvc, actionLog } = useServices();
    const [lines, setLines] = useState<ILine[]>([]);
    const wkspaceRef = useRef<HTMLDivElement>(null);
    const observer = useRef<ResizeObserver>(undefined);
    const serial = useSettingSerialise();
    const setError = useSetAtom(errorNotification);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (wkspaceRef.current) {
            observer.current = new ResizeObserver(() => {
                if (wkspaceRef.current) {
                    const nodes = extractNodesFromElements(wkspaceRef.current as HTMLElement);
                    setLines(generateLines(nodes, connections));
                }
            });
            observer.current.observe(wkspaceRef.current);
            const children = wkspaceRef.current.children;
            if (children) {
                for (let i = 0; i < children.length; ++i) {
                    const child = children[i];
                    observer.current.observe(child);
                }
            }
            return () => {
                observer.current?.disconnect();
            };
        }
    }, []);

    const doSave = useCallback(async () => {
        // Validate all metadata
        let valid = true;
        const content = contentSvc.getAllContent();
        content.forEach((content) => {
            const meta = contentSvc.getContentMetadata(content);
            if (!meta) {
                setError((err) => {
                    const e = new Set(err);
                    e.add('content_not_found');
                    valid = false;
                    return e;
                });
            } else {
                if (!meta.embedding) {
                    setError((err) => {
                        const e = new Set(err);
                        e.add('missing_embeddings');
                        valid = false;
                        return e;
                    });
                }
                if (meta.cluster === undefined) {
                    setError((err) => {
                        const e = new Set(err);
                        e.add('missing_cluster');
                        valid = false;
                        return e;
                    });
                }
                if (!meta.point) {
                    setError((err) => {
                        const e = new Set(err);
                        e.add('missing_points');
                        valid = false;
                        return e;
                    });
                }
            }
        });

        if (!valid) return;

        const lowResProm = content.map(async (c) => {
            const meta = contentSvc.getContentMetadata(c);
            const data = contentSvc.getContentData(c);
            const ldata = contentSvc.getContentData(c, true);
            if (data && meta) {
                if (!ldata || ldata.length === data.length) {
                    const lowcanv = await canvasFromURL(data, 100);
                    const lowdata = lowcanv.toDataURL('image/jpeg', 0.95);
                    contentSvc.addContentData({ normal: data, lowRes: lowdata }, meta);
                }
            }
        });
        await Promise.all(lowResProm);

        saveFile(profilerSvc, contentSvc, actionLog, {
            includeContent: true,
            includeProfiles: false,
            includeLogs: false,
            includeGraph: false,
            settings: await serial(),
        });
    }, [actionLog, contentSvc, profilerSvc, serial, setError]);

    return (
        <I18nextProvider
            i18n={i18n}
            defaultNS="tools"
        >
            <div className={style.workspace}>
                <div
                    className={style.container}
                    ref={wkspaceRef}
                >
                    <SvgLayer lines={lines} />
                    <QueryGenerator disabled={false} />
                    <ContentSummary
                        onFindMore={() => {
                            // setQuery(tags.join(' '));
                        }}
                    />
                    <EmbeddingTool />
                    <ContentClustering />
                    <MappingTool />
                    <ContentBrowserWidget />
                </div>
            </div>
            <IconMenu
                placement="top"
                label={<div className={style.menuLogo}>{t('creator.titles.creator')}</div>}
            >
                <IconMenuItem tooltip={t('creator.tooltips.download')}>
                    <IconButton
                        color="inherit"
                        onClick={doSave}
                    >
                        <DownloadIcon />
                    </IconButton>
                </IconMenuItem>
                <IconMenuItem tooltip={t('creator.tooltips.deleteAll')}>
                    <IconButton
                        color="inherit"
                        onClick={() => contentSvc.reset()}
                    >
                        <BlockIcon />
                    </IconButton>
                </IconMenuItem>
                <IconMenuItem tooltip={t('creator.labels.showSettings')}>
                    <IconButton
                        color="inherit"
                        onClick={() => setShowSettings(true)}
                        aria-label={t('creator.labels.showSettings')}
                    >
                        <SettingsIcon />
                    </IconButton>
                </IconMenuItem>
            </IconMenu>
            <ContentSettingsDialog
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </I18nextProvider>
    );
}
