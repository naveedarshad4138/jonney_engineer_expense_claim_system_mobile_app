import 'dotenv/config';

export default {
  expo: {
    name: "Abml expenses",
    slug: "claims-expense-system",
    android: {
      package: "com.naveed_arshad.jonneyapp", // ✅ REQUIRED
      adaptiveIcon: {
        foregroundImage: "https://advancedbml.engineering/api/uploads/logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    ios: {
      bundleIdentifier: "com.abml.expense", // ✅ REQUIRED
      adaptiveIcon: {
        foregroundImage: "https://advancedbml.engineering/api/uploads/logo.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL,
      eas: {
        projectId: "419cc52e-6956-4f48-bbc4-4be906554095"
      }
    }
  }
};
