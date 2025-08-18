import 'dotenv/config';

export default {
  expo: {
    name: "Jonney App",
    slug: "jonney",
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
    },
  },
};
