import { generatePath } from 'react-router-dom'

class RouteError extends Error {
    constructor(msg) {
        super('RouteError: ' + msg)
    }
}

const routeConfig = [
    {
        path: '/game/create',
        title: 'Create Game',
        component: './routes/CreateGame.js',
        name: 'create-game',
    },
    {
        path: '/game/join/:id',
        title: 'Join Game',
        component: './routes/JoinGame.js',
        name: 'join-game-by-id',
    },
    {
        path: '/game/join',
        title: 'Join Game',
        component: './routes/JoinGame.js',
        name: 'join-game',
    },
    {
        path: '/',
        title: 'Tanks',
        component: './routes/Homepage.js',
        name: 'home',
    },
]

export default routeConfig;

export const reverse = (name, params = {}, queryParams = {}) => {
    const routes = routeConfig.filter((route) => route.name === name)
    if (routes.length === 0) {
        throw new RouteError(`No matches found in routeConfig for ${name}`)
    } else if (routes.length > 1) {
        throw new RouteError(
            `Multiple matches found in routeConfig for ${name}: ${routes
                .map((r) => r.path)
                .join(', ')}`
        )
    }
    // this will raise a TypeError if params provided do not match the path
    const path = generatePath(routes[0].path, params)
    if (Object.entries(queryParams).length) {
        const searchParams = new URLSearchParams(queryParams)

        return `${path}?${searchParams.toString()}`
    }
    return path
}
