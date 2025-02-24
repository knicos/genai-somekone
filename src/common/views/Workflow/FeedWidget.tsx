import { Widget } from '@genaism/common/components/WorkflowLayout';
import { useProfilerService } from '@genaism/hooks/services';
import { ScoredRecommendation, UserNodeData, UserNodeId } from '@knicos/genai-recom';
import Feed from '../Feed/Feed';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from 'react-i18next';
import UserDialog from '../UserListing/UserDialog';
import { useSetRecoilState } from 'recoil';
import { menuSelectedUser } from '@genaism/apps/Dashboard/state/menuState';

interface Props {
    id: UserNodeId;
    hideMenu?: boolean;
    onProfile?: (profile: UserNodeData) => void;
    onRecommend?: (recommendations: ScoredRecommendation[]) => void;
    onLog?: () => void;
}

export default function FeedWidget({ id, onProfile, onRecommend, onLog, hideMenu }: Props) {
    const profiler = useProfilerService();
    const name = profiler.getUserName(id);
    const anchorEl = useRef<HTMLButtonElement>(null);
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [openUserList, setOpenUserList] = useState(false);
    const setSelected = useSetRecoilState(menuSelectedUser);

    return (
        <Widget
            title={name}
            dataWidget="feed"
            style={{ width: '400px', maxWidth: '80%' }}
            contentStyle={{ height: '600px' }}
            noPadding
            menu={
                hideMenu ? undefined : (
                    <div>
                        <IconButton
                            ref={anchorEl}
                            onClick={() => setMenuOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl.current}
                            open={menuOpen}
                            onClose={() => setMenuOpen(false)}
                        >
                            <MenuItem
                                onClick={() => {
                                    setOpenUserList(true);
                                    setMenuOpen(false);
                                }}
                            >
                                {t('workflow.actions.selectUser')}
                            </MenuItem>
                        </Menu>
                    </div>
                )
            }
        >
            <UserDialog
                open={openUserList}
                onClose={() => setOpenUserList(false)}
                onSelect={(u) => setSelected(u[0])}
            />
            <Feed
                id={id}
                noHeader
                alwaysActive
                onProfile={onProfile}
                onRecommend={onRecommend}
                onLog={onLog}
            />
        </Widget>
    );
}
