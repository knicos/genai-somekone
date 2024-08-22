import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import { useRecoilState } from 'recoil';
import { menuGraphType } from '@genaism/state/menuState';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import style from './style.module.css';
import CollectionsIcon from '@mui/icons-material/Collections';
import TagIcon from '@mui/icons-material/Tag';
import AppsIcon from '@mui/icons-material/Apps';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useCallback } from 'react';

interface Props {
    open?: boolean;
}

export default function MenuTree({ open }: Props) {
    const { t } = useTranslation();
    const [graphMode, setGraphMode] = useRecoilState(menuGraphType);

    const doClick = useCallback(
        (_: unknown, item: string) => {
            switch (item) {
                case 'graphs-social':
                    setGraphMode('social');
                    break;
                case 'graphs-heatmap':
                    setGraphMode('heat');
                    break;
                case 'graphs-grid':
                    setGraphMode('grid');
                    break;
                case 'graphs-content':
                    setGraphMode('content');
                    break;
                case 'graphs-topic':
                    setGraphMode('topic');
                    break;
            }
        },
        [setGraphMode]
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
                            <div className={graphMode === 'social' ? style.treeItemSelected : style.treeItem}>
                                <PeopleIcon />
                                {t('dashboard.labels.showSocialGraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-heatmap"
                        label={
                            <div className={graphMode === 'heat' ? style.treeItemSelected : style.treeItem}>
                                <LocalFireDepartmentIcon />
                                {t('dashboard.labels.showHeatGraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-grid"
                        label={
                            <div className={graphMode === 'grid' ? style.treeItemSelected : style.treeItem}>
                                <AppsIcon />
                                {t('dashboard.labels.showUserGrid')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-content"
                        label={
                            <div className={graphMode === 'content' ? style.treeItemSelected : style.treeItem}>
                                <CollectionsIcon />
                                {t('dashboard.labels.showContentGraph')}
                            </div>
                        }
                    />
                    <TreeItem
                        itemId="graphs-topic"
                        label={
                            <div className={graphMode === 'topic' ? style.treeItemSelected : style.treeItem}>
                                <TagIcon />
                                {t('dashboard.labels.showTopicGraph')}
                            </div>
                        }
                    />
                </TreeItem>
            </SimpleTreeView>
        </div>
    );
}
