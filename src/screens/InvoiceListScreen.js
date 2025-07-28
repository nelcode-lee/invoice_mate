import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import EmailInvoiceModal from '../components/EmailInvoice/EmailInvoiceModal';
import { BulkEmailModal, PaymentReminderModal } from '../components/BulkActions/BulkEmailModal';
import { api } from '../services/api';
import { formatCurrency } from '../utils/vatCalculation';
import { isOverdue, getDaysOverdue } from '../utils/dateHelpers';
import DateTimePicker from '@react-native-community/datetimepicker';

const InvoiceListScreen = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [bulkEmailModalVisible, setBulkEmailModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterDate, setFilterDate] = useState(null);
  const [sortByValueDesc, setSortByValueDesc] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await api.getInvoices();
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoicePress = (invoice) => {
    if (selectionMode) {
      toggleInvoiceSelection(invoice);
    } else {
      // Navigate to invoice details
      console.log('Navigate to invoice details:', invoice.id);
    }
  };

  const handleInvoiceLongPress = (invoice) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedInvoices([invoice]);
    }
  };

  const toggleInvoiceSelection = (invoice) => {
    setSelectedInvoices(prev => {
      const isSelected = prev.find(i => i.id === invoice.id);
      if (isSelected) {
        const newSelection = prev.filter(i => i.id !== invoice.id);
        if (newSelection.length === 0) {
          setSelectionMode(false);
        }
        return newSelection;
      } else {
        return [...prev, invoice];
      }
    });
  };

  const handleEmailInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setEmailModalVisible(true);
  };

  const handlePaymentReminder = (invoice) => {
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    
    if (dueDate > today) {
      Alert.alert('Info', 'This invoice is not yet overdue.');
      return;
    }
    
    setSelectedInvoice(invoice);
    setReminderModalVisible(true);
  };

  const handleBulkEmail = () => {
    const invoicesWithEmail = selectedInvoices.filter(inv => inv.client?.email);
    
    if (invoicesWithEmail.length === 0) {
      Alert.alert('Error', 'None of the selected invoices have client email addresses.');
      return;
    }
    
    if (invoicesWithEmail.length < selectedInvoices.length) {
      Alert.alert(
        'Warning', 
        `${selectedInvoices.length - invoicesWithEmail.length} invoices will be skipped due to missing email addresses.`
      );
    }
    
    setBulkEmailModalVisible(true);
  };

  const renderInvoiceItem = ({ item }) => {
    const isSelected = selectedInvoices.find(i => i.id === item.id);
    const isOverdueInvoice = isOverdue(item.due_date) && item.status !== 'paid';
    
    return (
      <TouchableOpacity
        style={[
          styles.invoiceItem,
          isSelected && styles.selectedItem,
          isOverdueInvoice && styles.overdueItem
        ]}
        onPress={() => handleInvoicePress(item)}
        onLongPress={() => handleInvoiceLongPress(item)}
      >
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
          <Text style={[styles.status, getStatusStyle(item.status)]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.clientName}>{item.client?.name}</Text>
        <Text style={styles.amount}>£{(item.total_pence / 100).toFixed(2)}</Text>
        
        {isOverdueInvoice && (
          <Text style={styles.overdueText}>
            {getDaysOverdue(item.due_date)} days overdue
          </Text>
        )}
        
        {!selectionMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEmailInvoice(item)}
            >
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            
            {isOverdueInvoice && (
              <TouchableOpacity
                style={[styles.actionButton, styles.reminderButton]}
                onPress={() => handlePaymentReminder(item)}
              >
                <Text style={styles.actionButtonText}>Remind</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid': return { color: '#34C759' };
      case 'overdue': return { color: '#FF3B30' };
      case 'draft': return { color: '#FF9500' };
      case 'sent': return { color: '#007AFF' };
      default: return { color: '#666' };
    }
  };

  // Filter and sort logic
  const getFilteredInvoices = () => {
    let filtered = invoices;
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(inv =>
        (inv.client?.name?.toLowerCase().includes(lower) ||
         inv.invoice_number?.toLowerCase().includes(lower))
      );
    }
    if (filterDate) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return (
          invDate.getFullYear() === filterDate.getFullYear() &&
          invDate.getMonth() === filterDate.getMonth() &&
          invDate.getDate() === filterDate.getDate()
        );
      });
    }
    if (sortByValueDesc) {
      filtered = [...filtered].sort((a, b) => b.total_pence - a.total_pence);
    }
    return filtered;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter/Search Bar */}
      <View style={styles.filterBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by company or invoice #"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.filterButtonText}>{filterDate ? filterDate.toLocaleDateString() : 'Date'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortByValueDesc && styles.activeSortButton]}
          onPress={() => setSortByValueDesc(v => !v)}
        >
          <Text style={styles.filterButtonText}>£↓</Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setFilterDate(date);
          }}
        />
      )}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={getFilteredInvoices()}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No invoices found</Text>
              <Text style={styles.emptySubtext}>Create your first invoice to get started</Text>
            </View>
          }
        />
      )}

      <EmailInvoiceModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        invoice={selectedInvoice}
        onEmailSent={(result) => {
          console.log('Email sent:', result);
          loadInvoices(); // Refresh the list
        }}
      />

      <BulkEmailModal
        visible={bulkEmailModalVisible}
        onClose={() => setBulkEmailModalVisible(false)}
        selectedInvoices={selectedInvoices}
        onEmailsSent={(result) => {
          setSelectionMode(false);
          setSelectedInvoices([]);
          loadInvoices(); // Refresh the list
        }}
      />

      <PaymentReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        invoice={selectedInvoice}
        onReminderSent={(result) => {
          console.log('Reminder sent:', result);
          loadInvoices(); // Refresh the list
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007AFF',
  },
  selectionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  bulkActionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  bulkActionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
  },
  invoiceItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  overdueItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  clientName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  overdueText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  reminderButton: {
    backgroundColor: '#FF9500',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
    backgroundColor: 'white',
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    marginLeft: 4,
  },
  filterButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
  },
});

export default InvoiceListScreen; 