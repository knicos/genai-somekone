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
import { useLocation, useNavigate } from 'react-router';

interface Props {
    open?: boolean;
}

export default function MenuTree({ open }: Props) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const page = location.pathname.split('/').pop();

    const doClick = useCallback(
        (_: unknown, item: string) => {
            switch (item) {
                case 'graphs-social':
                    navigate('socialgraph');
                    break;
                case 'graphs-heatmap':
                    navigate('heatmaps');
                    break;
                case 'graphs-grid':
                    navigate('usergrid');
                    break;
                case 'graphs-content':
                    navigate('contentgraph');
                    break;
                case 'graphs-topic':
                    navigate('topicgraph');
                    break;
                case 'tables-actionlog':
                    navigate('actionlog');
                    break;
                case 'tables-user':
                    navigate('userstats');
                    break;
                case 'tables-content':
                    navigate('contentengage');
                    break;
                case 'tables-topics':
                    navigate('topictable');
                    break;
            }
        },
        [navigate]
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
                            {t('dashboard.labels.viewOptions')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="graphs-social"
                        label={
                            <div className={page === 'socialgraph' ? style.treeItemSelected : style.treeItem}>
                                <PeopleIcon />
                                {t('dashboard.labels.showSocialGraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-heatmap"
                        label={
                            <div className={page === 'heatmaps' ? style.treeItemSelected : style.treeItem}>
                                <LocalFireDepartmentIcon />
                                {t('dashboard.labels.showHeatGraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-grid"
                        label={
                            <div className={page === 'usergrid' ? style.treeItemSelected : style.treeItem}>
                                <AppsIcon />
                                {t('dashboard.labels.showUserGrid')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-content"
                        label={
                            <div className={page === 'contentgraph' ? style.treeItemSelected : style.treeItem}>
                                <CollectionsIcon />
                                {t('dashboard.labels.showContentGraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-topic"
                        label={
                            <div className={page === 'topicgraph' ? style.treeItemSelected : style.treeItem}>
                                <TagIcon />
                                {t('dashboard.labels.showTopicGraph')}
                            </div>
                        }
                    />
                </TreeItem>
                <TreeItem
                    itemId="tables"
                    label={
                        <div className={style.treeItem}>
                            <TableViewIcon />
                            {t('dashboard.labels.tables')}
                        </div>
                    }
                >
                    <TreeItem
                        itemId="tables-actionlog"
                        label={
                            <div className={page === 'actionlog' ? style.treeItemSelected : style.treeItem}>
                                <PhoneAndroidIcon />
                                {t('dashboard.labels.showActionLog')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tables-user"
                        label={
                            <div className={page === 'userstats' ? style.treeItemSelected : style.treeItem}>
                                <PersonIcon />
                                {t('dashboard.labels.showUserTable')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tables-content"
                        label={
                            <div className={page === 'contentengage' ? style.treeItemSelected : style.treeItem}>
                                <PersonIcon />
                                {t('dashboard.labels.showContentEngage')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="tables-topics"
                        label={
                            <div className={page === 'topictable' ? style.treeItemSelected : style.treeItem}>
                                <TagIcon />
                                {t('dashboard.labels.showTopicTable')}
                            </div>
                        }
                    />
                </TreeItem>
            </SimpleTreeView>
        </div>
    );
}
