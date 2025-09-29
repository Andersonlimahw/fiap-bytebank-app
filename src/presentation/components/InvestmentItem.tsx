import React from "react";
import { Image, Text, View } from "react-native";
import { getStyles } from "./InvestmentItem.styles";
import { formatCurrency, formatPercentage } from "@utils/format";
import type { Investment } from "@domain/entities/Investment";
import { useTheme } from "@store/themeStore";

interface InvestmentItemProps {
  item: Investment;
}

export function InvestmentItem({ item }: InvestmentItemProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const price = item.regularMarketPrice
    ? item.regularMarketPrice * item.quantity
    : 0;
  const change = item.regularMarketChangePercent ?? 0;

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.logoUrl }} style={styles.logo} />
      <View style={styles.infoContainer}>
        <Text style={styles.ticker}>{item.id}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.longName}
        </Text>
        <Text style={styles.quantity}>{`${item.quantity} cotas`}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatCurrency(price)}</Text>
        <Text
          style={[
            styles.change,
            change < 0 ? styles.negative : styles.positive,
          ]}
        >
          {formatPercentage(change)}
        </Text>
        <Text style={styles.regularMarketPrice}>
          {formatCurrency(item.regularMarketPrice || 0)}
        </Text>
      </View>
    </View>
  );
}
