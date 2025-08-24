import 'dotenv/config';

export default {
  expo: {
    name: "Jonney App",
    slug: "jonney",
    android: {
      package: "com.naveed_arshad.jonneyapp", // ✅ REQUIRED
      adaptiveIcon: {
        foregroundImage: "https://thumbs.dreamstime.com/b/black-mix-icon-claims-money-insurance-requirement-miscellaneous-logo-157708423.jpg",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      eas: {
        projectId: "96bbbbc4-07b6-42c4-902b-fb1d886c72e8"
      }
    }
  }
};
