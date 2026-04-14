export const getDashboardPath = (role: string | null) => {
    switch (role) {
        case "admin":
            return '/admin/dashboard';
        case 'tenant':
            return '/tenant/dashboard';
        default:
            return '/home';
    }
}