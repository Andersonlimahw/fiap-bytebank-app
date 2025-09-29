import React, { useEffect, useState, useMemo } from "react";
import {
  FlatList,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useInvestmentsViewModel } from "@presentation/viewmodels/useInvestmentsViewModel";
import { InvestmentItem } from "@components/InvestmentItem";
import { SwipeableRow } from "@components/SwipeableRow";
import { makeInvestmentsStyles } from "./InvestmentsScreen.styles";
import type { Investment } from "@domain/entities/Investment";
import { useTheme } from "@presentation/theme/theme";
import { useI18n } from "@presentation/i18n/I18nProvider";
import { Button } from "@components/Button";

export function InvestmentsScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const styles = useMemo(() => makeInvestmentsStyles(theme), [theme]);

  const {
    investments,
    isLoading,
    error,
    fetchInvestments,
    addInvestment,
    removeInvestment,
    searchQuery,
    setSearchQuery,
    suggestions,
  } = useInvestmentsViewModel();

  const [newQuantity, setNewQuantity] = useState("");
  const [searchIsOpen, setSearchIsOpen] = useState(false);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleTickerChange = (text: string) => {
    const upperText = text.toUpperCase();
    setSearchIsOpen(true);
    setSearchQuery(upperText);
    setNewQuantity("");
  };

  const handleSuggestionPress = (selectedTicket: any) => {
    setSearchQuery(selectedTicket.ticket);
    setNewQuantity(selectedTicket.quantity);
    setSearchIsOpen(false);
  };

  const handleAddInvestment = () => {
    const quantity = parseInt(newQuantity, 10);
    if (searchQuery && !isNaN(quantity) && quantity > 0) {
      addInvestment({ ticker: searchQuery, quantity });
      setSearchQuery("");
      setNewQuantity("");
      setSearchIsOpen(false);
    }
  };

  const confirmAndRemove = (ticker: string) => {
    removeInvestment(ticker);
  };

  const renderItem = ({ item }: { item: Investment }) => (
    <SwipeableRow onDelete={() => confirmAndRemove(item.id)}>
      <InvestmentItem item={item} />
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <View style={{ zIndex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder={t("investments.searchTicker")}
            placeholderTextColor={theme.colors.muted}
            value={searchQuery}
            onChangeText={handleTickerChange}
            onPressIn={() => setSearchIsOpen(true)}
            onFocus={() => setSearchIsOpen(true)}
            onBlur={() => setSearchIsOpen(false)}
            autoCapitalize="characters"
          />
          {searchIsOpen && suggestions?.length > 0 && (
            <FlatList
              style={styles.suggestionsList}
              data={suggestions}
              keyExtractor={(item) => item.ticket}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Text style={styles.suggestionText}>{item.ticket}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder={t("investments.quantity")}
          placeholderTextColor={theme.colors.muted}
          value={newQuantity}
          onChangeText={setNewQuantity}
          keyboardType="numeric"
        />
        <Button
          title={t("investments.add")}
          onPress={handleAddInvestment}
          disabled={isLoading}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={investments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchInvestments}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() =>
          !isLoading ? (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                {t("investments.emptyList")}
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          )
        }
      />
    </View>
  );
}
