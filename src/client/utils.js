export async function post(config) {
    const { url, data = {}, params = [], ...rest} = config;
    let urlObj = new URL(url, url.startsWith('http') ? '' : getCurrentDomain());
    Object.entries(params).forEach(([key, value]) => {
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

export async function get(config) {
    const { url, params = [], ...rest} = config;
    let urlObj = new URL(url, url.startsWith('http') ? '' : getCurrentDomain());
    Object.entries(params).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
    })

    const response = await fetch(urlObj.toString(), {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'GET',
        ...rest
    })
    return response.json();
}

export function getCurrentDomain() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}:${port}`
}

export function ucFirst(str) {
    return str[0].toUpperCase() + str.slice(1)
}