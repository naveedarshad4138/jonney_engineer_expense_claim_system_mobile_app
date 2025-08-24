import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useApi from '../hooks/useApi';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';


const categories = [
    'Fuel', 'Post', 'Car Service', 'Travel', 'Materials', 'Software',
  'Meals', 'Internet', 'Stationary', 'Office', 'Accomodation',
  'Other', 'Entertaining', 'Training Fees',
];

export const AddExpenseClaim = () => {
  const { postData, deleteData, loading } = useApi();
  const [showFromPicker, setShowFromPicker] = useState(false);
const [showToPicker, setShowToPicker] = useState(false);
  const [formDetails, setFormDetails] = useState({
    fromDate: '',
    toDate: '',
    name: '',
    approvedBy: '',
    notes: '',
  });

  const [expenses, setExpenses] = useState(
    categories.map((cat) => ({
      category: cat,
      jobs: [''],
      total: 0,
      file: null,
      fileurl: null,
    }))
  );

  const handleJobChange = (rowIndex, jobIndex, value) => {
    const updated = [...expenses];
    const parsedValue = parseFloat(value) || 0;
    updated[rowIndex].jobs[jobIndex] = parsedValue;

    updated[rowIndex].total = updated[rowIndex].jobs.reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );

    setExpenses(updated);
  };

 const pickDocument = async (index) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
      }

      let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
      if (!res.canceled && res.assets?.length > 0) {
        const image = res.assets[0];
        const formData = new FormData();

        formData.append('receipt', {
        uri: image.uri,
        name: image.fileName || `receipt-${index}.jpg`,
        type: image.mimeType || 'image/jpeg',
        });
        try{
            // Then use postData
            const uploadRes = await postData(
            'upload-file',
            formData,
            'Upload successful',
            'Upload failed',
            true // isMultipart
            );
            if (uploadRes && uploadRes.results?.fileUrl) {
            const updated = [...expenses];
            updated[index].file = {
                uri: image.uri,
                name: image.fileName || `receipt-${index}.jpg`,
                type: image.type || 'image/jpeg',
            };
            updated[index].fileurl = uploadRes.results.fileUrl; // from your API response
            setExpenses(updated);
            }
        }catch (err) {
        console.warn('Image pick/upload error:', err);
        alert('File upload failed. Try again');
        }

      }
    } catch (err) {
      console.warn('Image pick/upload error:', err);
      alert('File upload failed.');
    }
  };

  const handleSubmit = async () => {
    const totalAmount = expenses.reduce((sum, e) => sum + e.total, 0);

    const payload = {
      ...formDetails,
      totalAmount,
      expenses: expenses.map((exp) => ({
        category: exp.category,
        jobs: [...exp.jobs],
        total: exp.total,
        fileurl: exp.fileurl || null,
      })),
    };

    console.log('Submitting claim:', payload);
    console.log(payload.expenses)

    try {
      const res = await postData(
        'form/expense-claims',
        payload,
        'Claim submitted successfully',
        'Form submission failed'
      );
      
    } catch (error) {
       console.log(error)
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>General Info</Text>

      {/* FROM DATE */}
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

{/* TO DATE */}
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

      <Text style={styles.title}>Expenses</Text>

      {expenses.map((expense, idx) => (
        <View key={idx} style={styles.expenseBlock}>
          <Text style={styles.category}>{expense.category}</Text>

          <View style={styles.jobsRow}>
            {expense.jobs.map((jobValue, jobIdx) => (
              <TextInput
                key={jobIdx}
                placeholder={`Job ${jobIdx + 1}`}
                keyboardType="numeric"
                style={styles.inputSmall}
                value={jobValue?.toString() || ''}
                onChangeText={(text) => handleJobChange(idx, jobIdx, text)}
              />
            ))}
            <TouchableOpacity
              onPress={() => {
                const updated = [...expenses];
                updated[idx].jobs.push('');
                setExpenses(updated);
              }}
              style={styles.addJobBtn}
            >
              <Text style={{ fontSize: 16 }}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.totalText}>Total: £{expense.total.toFixed(2)}</Text>

          <TouchableOpacity onPress={() => pickDocument(idx)} style={styles.uploadBtn}>
            <Text>{expense.file ? '✓ Uploaded' : 'Upload Receipt'}</Text>
          </TouchableOpacity>

          {expense.file && expense.file.uri && (
            <View style={{ marginTop: 10, position: 'relative', width: 100 }}>
  <TouchableOpacity
    style={styles.removeImageBtn}
    onPress={async () => {
      if (expense.fileurl) {
        // const confirmed = confirm('Are you sure you want to remove this file?');
        // if (!confirmed) return;

        const updated = [...expenses];
        await deleteData(`delete-file?fileUrl=${expense.fileurl}`); // <- this line calls your API
        updated[idx].file = null;
        updated[idx].fileurl = null;
        setExpenses(updated);
      }
    }}
  >
    <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
  </TouchableOpacity>

  <Image
    source={{ uri: expense.file.uri }}
    style={{
      width: 100,
      height: 100,
      resizeMode: 'contain',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#ccc',
    }}
  />
  <Text style={{ fontSize: 12 }}>Filename: {expense.fileurl}</Text>
</View>

          )}
        </View>
      ))}

      <Text style={styles.totalText}>
        Total: £{expenses.reduce((sum, e) => sum + e.total, 0).toFixed(2)}
      </Text>

      <TouchableOpacity style={styles.sumbitButton} title="Submit Claim" onPress={handleSubmit} >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Submit Claim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: '#333',
  },
  expenseBlock: {
    marginBottom: 25,
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    margin: 4,
    width: 80,
    borderRadius: 4,
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    
  },
  uploadBtn: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 4,
    alignItems: 'center',
  },
  addJobBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1e7dd',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    // display: 'flex',
    borderWidth: 1,
    borderColor: '#91c2b1',
  },
  totalText: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sumbitButton: {
    marginBottom: 60,
    backgroundColor: '#7C3AED',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },


});
