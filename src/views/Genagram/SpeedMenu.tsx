import { SpeedDial, SpeedDialAction } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import MenuIcon from '@mui/icons-material/Menu';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import CloseIcon from '@mui/icons-material/Close';
import { useSetRecoilState } from 'recoil';
import { menuShowData } from '@genaism/state/menuState';
import { useState } from 'react';

export default function SpeedMenu() {
    const setShowData = useSetRecoilState(menuShowData);
    const [showMenu, setShowMenu] = useState(false);

    return (
        <SpeedDial
            open={showMenu}
            onClose={() => setShowMenu(false)}
            onOpen={() => setShowMenu(true)}
            direction="down"
            ariaLabel="Additional data views menu"
            icon={<MenuIcon />}
            openIcon={<CloseIcon />}
            FabProps={{ color: 'secondary' }}
        >
            <SpeedDialAction
                icon={<ShareIcon />}
                tooltipTitle={'Share your profile'}
                tooltipOpen
            />
            <SpeedDialAction
                icon={<QueryStatsIcon />}
                tooltipTitle={'Your data'}
                tooltipOpen
                onClick={() => {
                    setShowData(true);
                    setShowMenu(false);
                }}
            />
            <SpeedDialAction
                icon={<PersonIcon />}
                tooltipTitle={'Your profile'}
                tooltipOpen
            />
            <SpeedDialAction
                icon={<ImageSearchIcon />}
                tooltipTitle={'Your recommendations'}
                tooltipOpen
            />
        </SpeedDial>
    );
}
