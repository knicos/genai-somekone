import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import style from './style.module.css';
import CollectionsIcon from '@mui/icons-material/Collections';
import TagIcon from '@mui/icons-material/Tag';
import AppsIcon from '@mui/icons-material/Apps';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useCallback } from 'react';
import TableViewIcon from '@mui/icons-material/TableView';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PersonIcon from '@mui/icons-material/Person';
import HandymanIcon from '@mui/icons-material/Handyman';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRecoilState } from 'recoil';
import { menuSettingsDialog, menuShowSimulator } from '@genaism/state/menuState';
import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import TuneIcon from '@mui/icons-material/Tune';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface Props {
    open?: boolean;
}

export default function MenuTree({ open }: Props) {
    const { t } = useTranslation();
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [settingsDialog, setSettingsDialog] = useRecoilState(menuSettingsDialog);
    const [simulator, setSimulator] = useRecoilState(menuShowSimulator);

    const page = pathname.split('/').pop();

    const doClick = useCallback(
        (_: unknown, item: string) => {
            switch (item) {
                case 'graphs-social':
                    navigate('socialgraph' + search);
                    break;
                case 'graphs-heatmap':
                    navigate('heatmaps' + search);
                    break;
                case 'graphs-grid':
                    navigate('usergrid' + search);
                    break;
                case 'graphs-content':
                    navigate('contentgraph' + search);
                    break;
                case 'graphs-topic':
                    navigate('topicgraph' + search);
                    break;
                case 'tables-actionlog':
                    navigate('actionlog' + search);
                    break;
                case 'tables-user':
                    navigate('userstats' + search);
                    break;
                case 'tables-content':
                    navigate('contentengage' + search);
                    break;
                case 'tables-topics':
                    navigate('topictable' + search);
                    break;
                case 'tools-contentwizard':
                    navigate('contentwizard' + search);
                    break;
                case 'tools-browser':
                    navigate('browser' + search);
                    break;
                case 'guides-default':
                    setParams((prev) => {
                        prev.set('guide', 'default');
                        return prev;
                    });
                    break;
                case 'guides-none':
                    setParams((prev) => {
                        prev.delete('guide');
                        prev.delete('page');
                        return prev;
                    });
                    break;
                case 'settings-recom':
                    setSettingsDialog('recommendation');
                    break;
                case 'settings-app':
                    setSettingsDialog('app');
                    break;
                case 'tools-simulator':
                    setSimulator(true);
                    break;
            }
        },
        [navigate, setParams, search, setSettingsDialog, setSimulator]
    );

    return (
        <div
            className={style.treeContainer}
            style={open ? undefined : { display: 'none' }}
        >
            <SimpleTreeView
                style={{ alignSelf: 'flex-start' }}
                onItemClick={doClick}
            >
                <TreeItem
                    itemId="graphs"
                    label={
                        <div className={style.treeItem}>
                            <BubbleChartIcon />
                            {t('menu.vis.title')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="graphs-social"
                        label={
                            <div className={page === 'socialgraph' ? style.treeItemSelected : style.treeItem}>
                                <PeopleIcon />
                                {t('menu.vis.socialgraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-heatmap"
                        label={
                            <div className={page === 'heatmaps' ? style.treeItemSelected : style.treeItem}>
                                <LocalFireDepartmentIcon />
                                {t('menu.vis.heatmap')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-grid"
                        label={
                            <div className={page === 'usergrid' ? style.treeItemSelected : style.treeItem}>
                                <AppsIcon />
                                {t('menu.vis.usergrid')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-content"
                        label={
                            <div className={page === 'contentgraph' ? style.treeItemSelected : style.treeItem}>
                                <CollectionsIcon />
                                {t('menu.vis.coengagement')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-topic"
                        label={
                            <div className={page === 'topicgraph' ? style.treeItemSelected : style.treeItem}>
                                <TagIcon />
                                {t('menu.vis.topics')}
                            </div>
                        }
                    />
                </TreeItem>
                <TreeItem
                    itemId="tables"
                    label={
                        <div className={style.treeItem}>
                            <TableViewIcon />
                            {t('menu.tables.title')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="tables-actionlog"
                        label={
                            <div className={page === 'actionlog' ? style.treeItemSelected : style.treeItem}>
                                <PhoneAndroidIcon />
                                {t('menu.tables.actionlog')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tables-user"
                        label={
                            <div className={page === 'userstats' ? style.treeItemSelected : style.treeItem}>
                                <PersonIcon />
                                {t('menu.tables.userstats')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tables-content"
                        label={
                            <div className={page === 'contentengage' ? style.treeItemSelected : style.treeItem}>
                                <PersonIcon />
                                {t('menu.tables.contentengage')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tables-topics"
                        label={
                            <div className={page === 'topictable' ? style.treeItemSelected : style.treeItem}>
                                <TagIcon />
                                {t('menu.tables.topicengage')}
                            </div>
                        }
                    />
                </TreeItem>
                <TreeItem
                    itemId="guides"
                    label={
                        <div className={style.treeItem}>
                            <AutoStoriesIcon />
                            {t('menu.guides.title')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="guides-none"
                        label={
                            <div className={params.get('guide') === null ? style.treeItemSelected : style.treeItem}>
                                <NotInterestedIcon />
                                {t('menu.guides.none')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="guides-default"
                        label={
                            <div
                                className={params.get('guide') === 'default' ? style.treeItemSelected : style.treeItem}
                            >
                                <ImportContactsIcon />
                                {t('menu.guides.default')}
                            </div>
                        }
                    />
                </TreeItem>
                <TreeItem
                    itemId="tools"
                    label={
                        <div className={style.treeItem}>
                            <HandymanIcon />
                            {t('menu.tools.title')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="tools-contentwizard"
                        label={
                            <div className={page === 'contentwizard' ? style.treeItemSelected : style.treeItem}>
                                <AddPhotoAlternateIcon />
                                {t('menu.tools.addcontent')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tools-browser"
                        label={
                            <div className={page === 'browser' ? style.treeItemSelected : style.treeItem}>
                                <ImageSearchIcon />
                                {t('menu.tools.browseContent')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tools-simulator"
                        label={
                            <div className={simulator ? style.treeItemSelected : style.treeItem}>
                                <PsychologyIcon />
                                {t('menu.tools.simulator')}
                            </div>
                        }
                    />
                </TreeItem>
                <TreeItem
                    itemId="settings"
                    label={
                        <div className={style.treeItem}>
                            <SettingsIcon />
                            {t('menu.settings.title')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="settings-app"
                        label={
                            <div className={settingsDialog === 'app' ? style.treeItemSelected : style.treeItem}>
                                <AppSettingsAltIcon />
                                {t('menu.settings.app')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="settings-recom"
                        label={
                            <div
                                className={
                                    settingsDialog === 'recommendation' ? style.treeItemSelected : style.treeItem
                                }
                            >
                                <TuneIcon />
                                {t('menu.settings.recommendation')}
                            </div>
                        }
                    />
                </TreeItem>
            </SimpleTreeView>
        </div>
    );
}
