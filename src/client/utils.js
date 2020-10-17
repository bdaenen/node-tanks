export async function post(config) {
    const { url, data = {}, params = [], ...rest} = config;
    let urlObj = new URL(url, url.startsWith('http') ? '' : getCurrentDomain());
    Object.entries(params).forEach(([key, val]) => {
        urlObj.searchParams.append(key, value);
    })

    const response = await fetch(urlObj.toString(), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        method: 'POST',
        ...rest
    })
    return response.json();
}

export function getCurrentDomain() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}:${port}`
}