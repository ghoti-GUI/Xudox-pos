

export const getCsrfToken = () => {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return csrfToken || window.CSRF_TOKEN;
  };