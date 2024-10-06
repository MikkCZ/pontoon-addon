export const httpClient = {
  fetch: async (url: string): Promise<Response> => {
    return await fetch(url, { credentials: 'omit' });
  },
};
