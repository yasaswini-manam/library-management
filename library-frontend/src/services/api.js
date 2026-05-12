export const fetchWithAuth = async (url, options = {}) => {
  const userStr = localStorage.getItem('libraryUser');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API Request Failed');
  }

  return data.data; // Return the inner data object from ApiResponse
};
