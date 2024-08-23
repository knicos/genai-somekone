import { IconButton } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useRandom } from '@knicos/genai-base';
import { PrintData } from '@genaism/protocol/printProtocol';

interface Props {
    data: () => PrintData;
    path: string;
}

export default function PrintButton({ data, path }: Props) {
    const code = useRandom(5);

    return (
        <IconButton
            color="inherit"
            onClick={() => {
                const bc = new BroadcastChannel('printing');
                bc.onmessage = (ev: MessageEvent) => {
                    if (ev.data === `request_${code}`) {
                        bc.postMessage(data());
                        bc.close();
                    }
                };
                window.open(`/print/${code}/${path}`, '_blank');
            }}
        >
            <PrintIcon />
        </IconButton>
    );
}
