import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import useApi from '../../hooks/useApi';

const expenseCategories = [
  'Fuel',
  'Car Park Charges',
  'Travel',
  'Materials',
  'Sundries',
  'Meals',
  'Tools',
  'Software Services',
  'Meter Parking',
  'Accommodation',
  'SM8',
  'Entertaining',
  'Training Fees',
];

export const AddExpenseClaim = ({ route }) => {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  const { mode, claimData } = route.params || {};
  const {postData, deleteData} = useApi();
  const [jobs, setJobs] = useState([{ name: '' }]);
  const [formDetails, setFormDetails] = useState({
    fromDate: '',
    toDate: '',
    name: '',
    approvedBy: '',
    notes: '',
  });
  
  console.log(claimData)
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);


  const [expenses, setExpenses] = useState(
    expenseCategories.map(() => [
      { amount: '', receiptUri: null, noReceiptFlag: false, noReceiptReason: '', showReasonInput: false },
    ])
  );

  // Add new job
  const addJob = () => {
    setJobs([...jobs, { name: '' }]);
    const newExpenses = expenses.map((categoryJobs) => [
      ...categoryJobs,
      { amount: '', receiptUri: null, noReceiptFlag: false, noReceiptReason: '', showReasonInput: false },
    ]);
    setExpenses(newExpenses);
  };

  // Remove job
  const removeJob = (jobIndex) => {
    if (jobs.length === 1) {
      Alert.alert('Error', 'At least one job is required');
      return;
    }
    const newJobs = jobs.filter((_, i) => i !== jobIndex);
    const newExpenses = expenses.map((categoryJobs) =>
      categoryJobs.filter((_, i) => i !== jobIndex)
    );
    setJobs(newJobs);
    setExpenses(newExpenses);
  };

  // Update job name
  const updateJobName = (index, value) => {
    const newJobs = [...jobs];
    newJobs[index].name = value;
    setJobs(newJobs);
  };

  // Update amount
  const updateAmount = (catIndex, jobIndex, value) => {
    const newExpenses = [...expenses];
    newExpenses[catIndex][jobIndex].amount = value;
    setExpenses(newExpenses);
  };

  // Toggle no receipt flag (and reset reason, receipt)
  const toggleNoReceipt = (catIndex, jobIndex) => {
    const newExpenses = [...expenses];
    const jobData = newExpenses[catIndex][jobIndex];
    jobData.noReceiptFlag = !jobData.noReceiptFlag;

    if (!jobData.noReceiptFlag) {
      // Reset reason input and show attachment if toggled off
      jobData.noReceiptReason = '';
      jobData.showReasonInput = false;
    }
    setExpenses(newExpenses);
  };

  // Toggle between showing reason input and attachment button
  const toggleReasonInput = (catIndex, jobIndex) => {
    const newExpenses = [...expenses];
    const jobData = newExpenses[catIndex][jobIndex];
    jobData.showReasonInput = !jobData.showReasonInput;
    if (jobData.showReasonInput) {
      // If showing reason input, clear receipt
      jobData.receiptUri = null;
    }
    setExpenses(newExpenses);
  };

  // Update no receipt reason
  const updateNoReceiptReason = (catIndex, jobIndex, value) => {
    const newExpenses = [...expenses];
    newExpenses[catIndex][jobIndex].noReceiptReason = value;
    setExpenses(newExpenses);
  };

  // Pick receipt image
  const pickReceipt = async (catIndex, jobIndex) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Media library permission required!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });

  if (!result.canceled && result.assets.length > 0) {
    const image = result.assets[0];

    const formData = new FormData();
    formData.append('receipt', {
      uri: image.uri,
      name: image.fileName || `receipt-${catIndex}-${jobIndex}.jpg`,
      type: image.mimeType || 'image/jpeg',
    });

    try {
      const uploadRes = await postData(
        'upload-file',
        formData,
        'Upload successful',
        'Upload failed',
        true // isMultipart
      );

      if (uploadRes && uploadRes.results?.fileUrl) {
        const newExpenses = [...expenses];
        newExpenses[catIndex][jobIndex].receiptUri = image.uri; // still used for preview
        newExpenses[catIndex][jobIndex].receiptUrl = uploadRes.results.fileUrl; // NEW: for server
        newExpenses[catIndex][jobIndex].noReceiptFlag = false;
        newExpenses[catIndex][jobIndex].noReceiptReason = '';
        newExpenses[catIndex][jobIndex].showReasonInput = false;
        setExpenses(newExpenses);
      }
    } catch (err) {
      console.warn('Image upload error:', err);
      Alert.alert('Upload failed', 'Could not upload receipt');
    }
  }
  };


  // Remove attached receipt
  const removeReceipt = async (catIndex, jobIndex) => {
  const jobData = expenses[catIndex][jobIndex];

  if (jobData.receiptUrl) {
    try {
      await deleteData(`delete-file?fileUrl=${encodeURIComponent(jobData?.receiptUrl)}`, {}, 'File removed', 'Remove failed');
    } catch (err) {
      console.warn('File delete error:', err);
      Alert.alert('Error', 'Could not delete file from server');
    }
  }

  const newExpenses = [...expenses];
  newExpenses[catIndex][jobIndex].receiptUri = null;
  newExpenses[catIndex][jobIndex].receiptUrl = null;
  setExpenses(newExpenses);
};


  // Calculate totals
  const jobTotals = jobs.map((_, jobIndex) => {
    let total = 0;
    expenses.forEach((catJobs) => {
      const val = parseFloat(catJobs[jobIndex]?.amount) || 0;
      total += val;
    });
    return total;
  });

  const categoryTotals = expenses.map((catJobs) => {
    return catJobs.reduce((sum, jobData) => sum + (parseFloat(jobData.amount) || 0), 0);
  });

  const subtotal = categoryTotals.reduce((a, b) => a + b, 0);

  // Submit form validation
  const onSubmit = () => {
    // for (let c = 0; c < expenses.length; c++) {
    //   for (let j = 0; j < jobs.length; j++) {
    //     const jobData = expenses[c][j];
    //     if (jobData.receiptUri=='') {
    //       Alert.alert(
    //         'Validation Error',
    //         `Please provide reason for no receipt in "${expenseCategories[c]}", Job ${j + 1}`
    //       );
    //       return;
    //     }
    //   }
    // }
    ///////////////// Submit claim /////////////////
    const transformedData = {
  generalInfo: formDetails,
  jobs: jobs.map((job, jIdx) => ({
    name: job.name,
    expenses: expenseCategories.map((cat, cIdx) => {
      const e = expenses[cIdx][jIdx];
      return {
        category: cat,
        amount: parseFloat(e.amount) || 0,
        receiptUri: e.receiptUrl || null,
        noReceiptFlag: e.noReceiptFlag,
        noReceiptReason: e.noReceiptReason,
      };
    }),
  })),
  total: {
    subtotal,
    jobTotals,
    categoryTotals,
  },
};
postData('form/expense-claims', transformedData);
    ///////////////// Submit claim /////////////////
    // Alert.alert('Success', 'Expense claim submitted!');
  };
useEffect(() => {
  if (claimData) {
    setFormDetails({
      fromDate: claimData?.generalInfo?.fromDate || '',
      toDate: claimData?.generalInfo?.toDate || '',
      name: claimData?.generalInfo?.name || '',
      approvedBy: claimData?.generalInfo?.approvedBy || '',
      notes: claimData?.generalInfo?.notes || '',
    });

    const jobNames = claimData.jobs?.map(j => ({ name: j.name })) || [{ name: '' }];
    setJobs(jobNames);

    const newExpenses = expenseCategories.map((cat, cIdx) => {
      return claimData.jobs?.map(job => {
        const expense = job.expenses?.find(e => e.category === cat);
        return {
          amount: expense?.amount?.toString() || '',
          receiptUri: apiBaseUrl+'/uploads/'+expense?.receiptUrl || null,
          receiptUrl: eapiBaseUrl+'/uploads/'+expense?.receiptUrl || null,
          noReceiptFlag: expense?.noReceiptFlag || false,
          noReceiptReason: expense?.noReceiptReason || '',
          showReasonInput: !!expense?.noReceiptFlag && !apiBaseUrl+'/uploads/'+expense?.receiptUrl,
        };
      }) || [{ amount: '', receiptUri: null, receiptUrl: null, noReceiptFlag: false, noReceiptReason: '', showReasonInput: false }];
    });
    setExpenses(newExpenses);
  }
}, [claimData]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.title}>General Info</Text>

      <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.input}>
        <Text style={{ color: formDetails.fromDate ? '#000' : '#999' }}>
          {formDetails.fromDate || 'Select From Date'}
        </Text>
      </TouchableOpacity>
      {showFromPicker && (
        <DateTimePicker
          value={formDetails.fromDate ? new Date(formDetails.fromDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) {
              setFormDetails({ ...formDetails, fromDate: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.input}>
        <Text style={{ color: formDetails.toDate ? '#000' : '#999' }}>
          {formDetails.toDate || 'Select To Date'}
        </Text>
      </TouchableOpacity>
      {showToPicker && (
        <DateTimePicker
          value={formDetails.toDate ? new Date(formDetails.toDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) {
              setFormDetails({ ...formDetails, toDate: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
      )}

      <TextInput
        placeholder="Your Name"
        style={styles.input}
        value={formDetails.name}
        onChangeText={(text) => setFormDetails({ ...formDetails, name: text })}
      />

      <TextInput
        placeholder="Approved By"
        style={styles.input}
        value={formDetails.approvedBy}
        onChangeText={(text) => setFormDetails({ ...formDetails, approvedBy: text })}
      />

      <TextInput
        placeholder="Notes"
        style={styles.input}
        value={formDetails.notes}
        onChangeText={(text) => setFormDetails({ ...formDetails, notes: text })}
      />

      {/* Add Job Button */}
      {mode !== 'view' && (
        <TouchableOpacity onPress={addJob} style={styles.submitButton}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Job</Text>
        </TouchableOpacity>
      )}
      <ScrollView horizontal style={{ paddingX: 5 }}>
        <View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.labelCell, { backgroundColor: '#e0e0e0' }]}>
              <Text style={{ fontWeight: 'bold' }}>Expense</Text>
            </View>
            {jobs.map((job, idx) => (
              <View key={idx} style={[styles.headerCell, { flexDirection: 'row', alignItems: 'center' }]}>
                <TextInput
                  placeholder={`Job ${idx + 1}`}
                  style={[styles.jobInput, { flex: 1 }]}
                  value={job.name}
                  onChangeText={(text) => updateJobName(idx, text)}
                />
                <TouchableOpacity
                  onPress={() => removeJob(idx)}
                  style={styles.removeJobBtn}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={[styles.totalCell, { backgroundColor: '#e0e0e0' }]}>
              <Text style={{ fontWeight: 'bold' }}>Total</Text>
            </View>
          </View>



          {/* Expense Rows */}
          {expenseCategories.map((category, catIndex) => (
            <View
              key={catIndex}
              style={[
                styles.row,
                catIndex % 2 === 1 ? styles.zebraRow : null,
              ]}
            >
              <View style={styles.labelCell}>
                <Text>{category}</Text>
              </View>

              {jobs.map((_, jobIndex) => {
                const jobData = expenses[catIndex][jobIndex];
                return (
                  <View key={jobIndex} style={styles.amountCell}>
                    <TextInput
                      placeholder="£0.00"
                      keyboardType="numeric"
                      style={styles.amountInput}
                      value={jobData.amount}
                      onChangeText={(text) => updateAmount(catIndex, jobIndex, text)}
                    />

                    {!jobData.showReasonInput ? (
                      <>
                        <TouchableOpacity onPress={() => pickReceipt(catIndex, jobIndex)} style={styles.uploadBtn}>
                          <Text style={{ fontSize: 14 }}>
                            {jobData.receiptUri ? '📎 Attached' : 'Attach'}
                          </Text>
                        </TouchableOpacity>

                        {jobData.receiptUri && (
                          <View style={{ marginTop: 6, position: 'relative' }}>
                            <Image
                              source={{ uri: jobData.receiptUri }}
                              style={styles.imagePreview}
                            />
                            <TouchableOpacity
                              onPress={() => removeReceipt(catIndex, jobIndex)}
                              style={styles.removeImageBtn}
                            >
                              <Text style={{ color: 'white', fontWeight: 'bold' }}>×</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    ) : (
                      <TextInput
                        placeholder="Reason for no attachment"
                        style={[styles.reasonInput, { marginTop: 6 }]}
                        value={jobData.noReceiptReason}
                        onChangeText={(text) =>
                          updateNoReceiptReason(catIndex, jobIndex, text)
                        }
                      />
                    )}

                    <TouchableOpacity
                      onPress={() => toggleReasonInput(catIndex, jobIndex)}
                      style={styles.toggleReasonBtn}
                    >
                      <Text style={{ fontSize: 10, color: 'blue' }}>
                        {jobData.showReasonInput ? 'Use Attachment' : 'Use Reason'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <View style={styles.totalCell}>
                <Text>£{categoryTotals[catIndex].toFixed(2)}</Text>
              </View>
            </View>
          ))}

          {/* Totals Row */}
          <View style={[styles.row, { backgroundColor: '#ddd' }]}>
            <View style={styles.labelCell}>
              <Text style={{ fontWeight: 'bold' }}>Total</Text>
            </View>
            {jobTotals.map((total, idx) => (
              <View key={idx} style={styles.amountCell}>
                <Text>£{total.toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.totalCell}>
              <Text style={{ fontWeight: 'bold' }}>£{subtotal.toFixed(2)}</Text>
            </View>
          </View>


        </View>
      </ScrollView>
      {/* Submit Button */}
      {mode !== 'view' && (
        <TouchableOpacity onPress={onSubmit} style={[styles.submitButton, styles.submitButton1]}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit Claim</Text>
        </TouchableOpacity>
      )}
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // marginTop: 30,
    paddingBottom: 50,
    backgroundColor: '#f9f9fb',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 6,
    justifyContent: 'center',
  },
  jobInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 14,

  },
  amountInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 14,

  },
  uploadBtn: {
    marginTop: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  noReceiptToggle: {
    marginTop: 6,
    alignItems: 'center',
  },
  toggleReasonBtn: {
    marginTop: 4,
    alignItems: 'center',
  },
  reasonInput: {
    height: 38,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 4,
    paddingHorizontal: 6,
    fontSize: 13,
    width: 130,
  },
  removeJobBtn: {
    marginLeft: 8,
    backgroundColor: 'red',
    borderRadius: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginTop: 6,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(255,0,0,0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  tableContainer: {
    padding: 10,
    minWidth: 150 + 140 * 3 + 90, // Adjust based on typical job count
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },

  headerCell: {
    minWidth: 140,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  zebraRow: {
    backgroundColor: '#fafafa',
  },

  labelCell: {
    minWidth: 120,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },

  amountCell: {
    minWidth: 140,
    paddingHorizontal: 6,
  },

  totalCell: {
    minWidth: 90,
    paddingHorizontal: 6,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },

  submitButton: {
    marginTop: 30,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    // maxWidth: 200,
    width: 150,
    alignSelf: 'flex-start',
  },
  submitButton1: {
    marginBottom: 40
  },
  input: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    marginTop: 30,
    fontWeight: 'bold',
    marginVertical: 16,
  },


});
