import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useCurrencyQuoteViewModel } from '@presentation/viewmodels/useCurrencyQuoteViewModel';
import { styles } from './CurrencyQuoteCard.styles';
import { formatCurrency, formatPercentage } from '@utils/format';
import { MaterialIcons } from '@expo/vector-icons';

export function CurrencyQuoteCard() {
  const { quote, isLoading, error } = useCurrencyQuoteViewModel();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !quote) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Cotação indisponível'}</Text>
      </View>
    );
  }

  const change = quote.pctChange ?? 0;
  const isPositive = change >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="attach-money" size={24} color="#000" />
        <Text style={styles.title}>Dólar (USD)</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.priceLabel}>Valor de compra</Text>
        <Text style={styles.price}>{formatCurrency(quote.bid)}</Text>
        <View style={[styles.changeContainer, isPositive ? styles.positiveBg : styles.negativeBg]}>
          <MaterialIcons name={isPositive ? 'arrow-upward' : 'arrow-downward'} size={14} color="#fff" />
          <Text style={styles.changeText}>{formatPercentage(change)} na variação diária</Text>
        </View>
      </View>
    </View>
  );
}
