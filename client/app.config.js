import 'dotenv/config';

export default {
  expo: {
    name: "Claims Expense System",
    slug: "claims-expense-system",
    android: {
      package: "com.naveed_arshad.jonneyapp", // ✅ REQUIRED
      adaptiveIcon: {
        foregroundImage: "https://thumbs.dreamstime.com/b/black-mix-icon-claims-money-insurance-requirement-miscellaneous-logo-157708423.jpg",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    ios: {
      bundleIdentifier: "com.abml.expense", // ✅ REQUIRED
      adaptiveIcon: {
        foregroundImage: "https://thumbs.dreamstime.com/b/black-mix-icon-claims-money-insurance-requirement-miscellaneous-logo-157708423.jpg",
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
