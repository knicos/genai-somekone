import Loading from '@genaism/components/Loading/Loading';
import usePeer from '@genaism/hooks/peer';
import { EventProtocol } from '@genaism/protocol/protocol';
import randomId from '@genaism/util/randomId';
import { useCallback } from 'react';
import { useParams } from 'react-router';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';

const MYCODE = randomId(10);

export function Component() {
    const { code } = useParams();

    const onData = useCallback((data: EventProtocol) => {
        console.log('GOT DATA', data);
    }, []);

    const { ready } = usePeer<EventProtocol>({ code: code && `sm-${MYCODE}`, server: `sm-${code}`, onData });

    return (
        <>
            <Loading
                loading={!ready}
                message="PLEASE WAIT"
            ></Loading>
            <ErrorDialog />
        </>
    );
}
