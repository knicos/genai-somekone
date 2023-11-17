import React from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';

interface Props extends React.PropsWithChildren {
    initializeState?: (snap: MutableSnapshot) => void;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>;
}
