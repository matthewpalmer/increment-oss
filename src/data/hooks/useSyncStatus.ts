import { useEffect, useState } from "react";

export function useSyncStatus() {
    const [status, setStatus] = useState('done');

    useEffect(() => {
        setInterval(() => {
            const rand = Math.random()
            if (rand > 0.75) return setStatus('loading...');
            if (Math.random() > 0.5) return setStatus('error...');
            if (Math.random() > 0.25) return setStatus('done...');
            if (Math.random() > 0) return setStatus('blahy...');
        }, 3000)
    }, [])

    return status;
}
