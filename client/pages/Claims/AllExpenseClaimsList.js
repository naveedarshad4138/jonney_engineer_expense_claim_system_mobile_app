import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import useApi from '../../hooks/useApi';
import { navigate } from '../../components/navigationRef';
import { useNavigation } from '@react-navigation/native';

export const AllExpenseClaimsList = () => {
  const navigation = useNavigation();
  const { fetchData, loading } = useApi();
  const [claims, setClaims] = useState([]);
  console.log(claims)
  const [selectedClaim, setSelectedClaim] = useState(null);

  const fetchClaims = async () => {
    try {
      const response = await fetchData('form');
      if (response?.results) {
        setClaims(response.results);
      }
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#7C3AED" />;
  }

  return (
    <ScrollView style={styles.container}>
      {selectedClaim ? (
  <>
    <TouchableOpacity onPress={() => setSelectedClaim(null)} style={{ marginBottom: 20 }}>
      <Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>← Back to All Claims</Text>
    </TouchableOpacity>
    <AddExpenseClaim mode="view" claimData={selectedClaim} />
  </>
) : (
  <>
    <Text style={styles.pageTitle}>Your Expense Claims</Text>
    {claims.length === 0 ? (
      <Text style={styles.noData}>No claims found.</Text>
    ) : (
      claims.map((claim, index) => (
        <View key={claim._id || index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Claim #{index + 1}</Text>
            <View style={styles.rightHeader}>
              <Text style={styles.amount}>£{claim.total?.subtotal.toFixed(2)}</Text>
              <View style={[styles.statusBadge, statusStyles[claim.status?.toLowerCase() || 'default']]}>
                <Text style={styles.statusText}>{claim.status || 'Unknown'}</Text>
              </View>
            </View>
          </View>
          <InfoRow label="📅 From:" value={new Date(claim.generalInfo?.fromDate).toDateString()} />
          <InfoRow label="📅 To:" value={new Date(claim.generalInfo?.toDate).toDateString()} />
          <InfoRow label="🙍 Name:" value={claim?.generalInfo?.name || '-'} />
          <InfoRow label="✅ Approved By:" value={claim?.generalInfo?.approvedBy || '-'} />
          {claim?.generalInfo?.notes ? <InfoRow label="📝 Notes:" value={claim?.generalInfo?.notes} multiline /> : null}

          <TouchableOpacity
             onPress={() => {
  navigation.navigate('AddExpenseClaim', {
    mode: 'view',
    claimData: claim,
  });
}}
            
            style={styles.viewBtn}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))
    )}
  </>
)}

    </ScrollView>
  );
};

// Small reusable component for label/value rows
const InfoRow = ({ label, value, multiline = false }) => (
  <View style={[styles.row, multiline && { alignItems: 'flex-start' }]}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, multiline && { flex: 1 }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 30,
    backgroundColor: '#f9fafb',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 18,
    fontStyle: 'italic',
  },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34495e',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#555',
    fontSize: 15,
    maxWidth: '40%',
  },
  value: {
    flex: 1,
    marginLeft: 10,
    color: '#444',
    fontSize: 15,
    textAlign: 'right',
  },
  breakdownTitle: {
    marginTop: 18,
    fontWeight: '700',
    fontSize: 16,
    color: '#2c3e50',
  },
  breakdown: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  expenseCategory: {
    color: '#34495e',
    fontWeight: '600',
    fontSize: 15,
  },
  expenseAmount: {
    fontWeight: '700',
    color: '#7C3AED',
    fontSize: 15,
  },
  viewBtn: {
  backgroundColor: '#7C3AED',
  paddingVertical: 10,
  paddingHorizontal: 15,
  marginTop: 15,
  borderRadius: 6,
  alignItems: 'center',
},

});

// Status badge colors
const statusStyles = StyleSheet.create({
  
  pending: {
    backgroundColor: '#f39c12', // orange
  },
  approved: {
    backgroundColor: '#27ae60', // green
  },
  rejected: {
    backgroundColor: '#e74c3c', // red
  },
  default: {
    backgroundColor: '#7f8c8d', // gray fallback
  },
});
