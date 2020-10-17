export default async function connect(host) {
    let socket = new WebSocket(host);

    return new Promise((resolve, reject) => {
        socket.onopen = (e) => {
            resolve(socket);
        }
        socket.onclose = (e) => {
            if (!e.wasClean) {
                reject(e)
            }
        }
        socket.onerror = (e) => {
            console.error('socket error', e);
        }
    })
}

export async function waitForSocket(host, retryInterval=1000, retryCount=10) {
    let retries = 0;
    return new Promise((resolve, reject) => {
        let intervalRef = setInterval(async () => {
            try {
                let socket = await connect(host);
                clearInterval(intervalRef);
                resolve(socket)
            }
            catch(err) {
                retries++;
                if (retries >= retryCount) {
                    clearInterval(intervalRef)
                    reject(err);
                }
            }
        }, retryInterval)
    })
}