import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { sendInvoiceEmail, sendInvoiceToClient } from '../../services/pdfService';
import { validateEmail } from '../../utils/ukValidation';
import { api } from '../../services/api';

const EmailInvoiceModal = ({ visible, onClose, invoice, onEmailSent }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);

  useEffect(() => {
    if (visible && invoice) {
      // Pre-fill with client email if available
      setRecipientEmail(invoice.client?.email || '');
      setRecipientName(invoice.client?.name || '');
      loadEmailTemplates();
    }
  }, [visible, invoice]);

  const loadEmailTemplates = async () => {
    try {
      const response = await api.getEmailTemplates();
      setEmailTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!validateEmail(recipientEmail).isValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const emailData = {
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        template_name: selectedTemplate,
        custom_message: customMessage || null
      };

      const result = await sendInvoiceEmail(invoice.id, emailData);
      
      Alert.alert('Success', 'Invoice sent successfully!');
      onEmailSent(result);
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToClient = async () => {
    if (!invoice.client?.email) {
      Alert.alert('Error', 'Client email not found');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendInvoiceToClient(
        invoice.id, 
        selectedTemplate, 
        customMessage || null
      );
      
      Alert.alert('Success', 'Invoice sent to client successfully!');
      onEmailSent(result);
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Invoice via Email</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Recipient Email *</Text>
            <TextInput
              style={styles.input}
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              placeholder="client@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Recipient Name</Text>
            <TextInput
              style={styles.input}
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="Client Name"
            />
          </View>

          <View style={styles.field}>
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
                {emailTemplates.map(template => (
                  <Picker.Item 
                    key={template.id} 
                    label={template.name} 
                    value={template.name} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Custom Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Add a personal message..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonContainer}>
            {invoice?.client?.email && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleSendToClient}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  Send to Client ({invoice.client.email})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleSendEmail}
              disabled={isLoading || !recipientEmail}
            >
              <Text style={styles.buttonText}>
                Send to Custom Email
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text>Sending email...</Text>
            </View>
          )}
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
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
};

export default EmailInvoiceModal; 