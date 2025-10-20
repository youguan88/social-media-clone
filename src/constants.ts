export const paths = {
  api: '/api',
  health: '/health',

  users: {
    base: '/users',
    register: '/register',
    login: '/login',
    me: '/me',
    profile: '/:username',
    follow: '/:id/follow',
    csrf: '/csrf-token',
  },

  posts: {
    base: '/posts',
    byUsername: '/by/:username',
  },
};

// params: An object of a key-value pair to replace (e.g., { id: 2 }).
export const createPath = (
  path: string,
  params: Record<string, string | number>,
): string => {
  let finalPath = path;
  for (const key in params) {
    finalPath = finalPath.replace(`:${key}`, String(params[key]));
  }
  return finalPath;
};
