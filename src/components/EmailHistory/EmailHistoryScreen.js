import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { api } from '../../services/api';
import { formatUKDateTime } from '../../utils/dateHelpers';

const EmailHistoryScreen = ({ invoiceId }) => {
  const [emailHistory, setEmailHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmailHistory();
  }, [invoiceId]);

  const loadEmailHistory = async () => {
    try {
      const response = await api.getInvoiceEmailHistory(invoiceId);
      setEmailHistory(response.data.email_history || []);
    } catch (error) {
      console.error('Failed to load email history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmailHistory();
    setRefreshing(false);
  };

  const renderEmailLog = ({ item }) => (
    <View style={styles.emailLog}>
      <View style={styles.emailHeader}>
        <Text style={styles.recipient}>{item.recipient_name || item.recipient_email}</Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.date}>{formatUKDateTime(item.sent_at)}</Text>
      {item.opened_at && (
        <Text style={styles.engagement}>Opened: {formatUKDateTime(item.opened_at)}</Text>
      )}
      {item.bounced && (
        <Text style={styles.bounce}>Bounced: {item.bounce_reason}</Text>
      )}
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'sent': return { color: '#34C759' };
      case 'failed': return { color: '#FF3B30' };
      case 'bounced': return { color: '#FF9500' };
      case 'delivered': return { color: '#007AFF' };
      case 'opened': return { color: '#34C759' };
      default: return { color: '#666' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return '✓';
      case 'failed': return '✗';
      case 'bounced': return '↻';
      case 'delivered': return '📧';
      case 'opened': return '👁';
      default: return '•';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading email history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Email History</Text>
        <Text style={styles.subtitle}>
          {emailHistory.length} email{emailHistory.length !== 1 ? 's' : ''} sent
        </Text>
      </View>
      
      <FlatList
        data={emailHistory}
        renderItem={renderEmailLog}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No emails sent for this invoice yet.</Text>
            <Text style={styles.emptySubtext}>
              Send an email to see the history here.
            </Text>
          </View>
        }
        ListHeaderComponent={
          emailHistory.length > 0 ? (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {emailHistory.filter(e => e.status === 'sent').length}
                </Text>
                <Text style={styles.statLabel}>Sent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {emailHistory.filter(e => e.status === 'opened').length}
                </Text>
                <Text style={styles.statLabel}>Opened</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {emailHistory.filter(e => e.status === 'bounced').length}
                </Text>
                <Text style={styles.statLabel}>Bounced</Text>
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emailLog: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recipient: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  subject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  engagement: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 3,
  },
  bounce: {
    fontSize: 12,
    color: '#FF9500',
    marginTop: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
};

export default EmailHistoryScreen; 