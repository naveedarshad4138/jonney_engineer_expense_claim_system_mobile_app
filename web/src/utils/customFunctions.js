 // Function to Base64 encode a string
const encodeBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

// Function to Base64 decode a string
export const decodeBase64 = (str) => {
  return decodeURIComponent(escape(atob(str)));
};

// Set token with expiration
export const setToken = (token, expiresIn) => {
  const expiresAt = new Date().getTime() + expiresIn * 1000; // milliseconds
  const payload = JSON.stringify({ token, expiresAt });
  const encoded = encodeBase64(payload);
  localStorage.setItem('authToken', encoded);
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Get token and check if expired (more than 1 hour passed)
export const getToken = () => {
  const encoded = localStorage.getItem('authToken');
  if (!encoded) return null;

  try {
    const decoded = decodeBase64(encoded);
    const { expiresAt } = JSON.parse(decoded);
    const currentTime = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // in milliseconds

    if (currentTime - expiresAt > oneHour) {
      // Token expired more than 1 hour ago
      removeToken();

      return null;
    }

    return encoded;
  } catch (e) {
    console.error('Invalid token format:', e);
    removeToken();
    return null;
  }
};