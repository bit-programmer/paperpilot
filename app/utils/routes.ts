import { clientPaths } from "./path.client"

export const PROTECTED_ROUTES = [
    clientPaths.dashboard.path
]

export const NON_PROTECTED_ROUTES = [
    clientPaths.signin.path,
    clientPaths.signup.path,
    clientPaths.confirmEmailNotification.path
]