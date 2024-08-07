

export const getCsrfToken = () => {
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken'))
        ?.split('=')[1];
    return csrfToken || window.CSRF_TOKEN;
};

export const csrfToken = getCsrfToken();
export const token = localStorage.getItem('access_token')