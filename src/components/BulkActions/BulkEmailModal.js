import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../../services/api';

const BulkEmailModal = ({ visible, onClose, selectedInvoices, onEmailsSent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');

  const handleBulkSend = async () => {
    setIsLoading(true);
    try {
      const invoiceIds = selectedInvoices.map(invoice => invoice.id);
      const result = await api.sendBulkInvoices({
        invoice_ids: invoiceIds,
        template_name: selectedTemplate
      });

      Alert.alert(
        'Bulk Email Complete',
        `${result.data.successful} of ${result.data.total_sent} emails sent successfully.`
      );
      
      onEmailsSent(result.data);
      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to send bulk emails: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.invoiceItem}>
      <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
      <Text style={styles.clientName}>{item.client?.name}</Text>
      <Text style={styles.clientEmail}>{item.client?.email || 'No email'}</Text>
      <Text style={styles.amount}>£{(item.total_pence / 100).toFixed(2)}</Text>
    </View>
  );

  const invoicesWithEmail = selectedInvoices.filter(inv => inv.client?.email);
  const invoicesWithoutEmail = selectedInvoices.filter(inv => !inv.client?.email);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Bulk Invoices</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.subtitle}>
            Selected Invoices ({selectedInvoices.length})
          </Text>
          
          {invoicesWithoutEmail.length > 0 && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ {invoicesWithoutEmail.length} invoice(s) will be skipped due to missing email addresses
              </Text>
            </View>
          )}

          <View style={styles.templateSection}>
            <Text style={styles.label}>Email Template</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTemplate}
                onValueChange={setSelectedTemplate}
                style={styles.picker}
              >
                <Picker.Item label="Default Invoice" value="default" />
                <Picker.Item label="Professional" value="professional" />
                <Picker.Item label="Friendly Reminder" value="reminder" />
              </Picker>
            </View>
          </View>
          
          <FlatList
            data={invoicesWithEmail}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.invoiceList}
            scrollEnabled={false}
          />

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleBulkSend}
            disabled={isLoading || invoicesWithEmail.length === 0}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : `Send ${invoicesWithEmail.length} Invoices`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// Payment Reminder Component
const PaymentReminderModal = ({ visible, onClose, invoice, onReminderSent }) => {
  const [selectedReminderType, setSelectedReminderType] = useState('gentle');
  const [isLoading, setIsLoading] = useState(false);

  const reminderTypes = [
    { value: 'gentle', label: 'Gentle Reminder', description: 'Friendly payment reminder' },
    { value: 'firm', label: 'Firm Reminder', description: 'More direct payment request' },
    { value: 'final', label: 'Final Notice', description: 'Final payment warning' }
  ];

  const handleSendReminder = async () => {
    setIsLoading(true);
    try {
      const result = await api.sendPaymentReminder(invoice.id, selectedReminderType);
      Alert.alert('Success', 'Payment reminder sent successfully!');
      onReminderSent(result.data);
      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to send reminder: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Payment Reminder</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>Invoice: {invoice?.invoice_number}</Text>
            <Text style={styles.clientName}>{invoice?.client?.name}</Text>
            <Text style={styles.amount}>£{(invoice?.total_pence / 100).toFixed(2)}</Text>
            <Text style={styles.overdueInfo}>
              {isDaysOverdue(invoice?.due_date)} days overdue
            </Text>
          </View>

          <Text style={styles.subtitle}>Select Reminder Type:</Text>
          
          {reminderTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.reminderOption,
                selectedReminderType === type.value && styles.selectedOption
              ]}
              onPress={() => setSelectedReminderType(type.value)}
            >
              <Text style={styles.reminderLabel}>{type.label}</Text>
              <Text style={styles.reminderDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleSendReminder}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Sending...' : 'Send Reminder'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  templateSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  invoiceList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  invoiceItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },
  invoiceInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  overdueInfo: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 5,
  },
  reminderOption: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};

export { BulkEmailModal, PaymentReminderModal }; 