import { useCallback, useState, useEffect } from "react";
import { Alert } from "react-native";
import { useDI } from "@store/diStore";
import type { Investment } from "@domain/entities/Investment";
import { useAuthViewModel } from "@presentation/viewmodels/useAuthViewModel";
import { TOKENS } from "@core/di/container";
import type {
  TickerSuggestion,
  AddInvestimentInput,
} from "@data/b3/B3QuoteRepository";

const TICKETS = [
  { ticket: "MGLU3", quantity: 100 },
  { ticket: "B3SA3", quantity: 100 },
  { ticket: "PETR4", quantity: 100 },
  { ticket: "BBAS3", quantity: 100 },
  { ticket: "VALE3", quantity: 100 },
  { ticket: "RENT3", quantity: 100 },
  { ticket: "BBDC4", quantity: 100 },
  { ticket: "LREN3", quantity: 100 },
  { ticket: "SUZB3", quantity: 100 },
  { ticket: "CSAN3", quantity: 100 },
  { ticket: "ELET3", quantity: 100 },
  { ticket: "WEGE3", quantity: 100 },
  { ticket: "PRIO3", quantity: 100 },
  { ticket: "ABEV3", quantity: 100 },
  { ticket: "TIMS3", quantity: 100 },
  { ticket: "UGPA3", quantity: 100 },
  { ticket: "EQTL3", quantity: 100 },
  { ticket: "NATU3", quantity: 100 },
  { ticket: "BBSE3", quantity: 100 },
  { ticket: "HAPV3", quantity: 100 },
  { ticket: "RDOR3", quantity: 100 },
  { ticket: "CYRE3", quantity: 100 },
  { ticket: "BRAV3", quantity: 100 },
  { ticket: "VIVT3", quantity: 100 },
  { ticket: "TOTS3", quantity: 100 },
  { ticket: "COGN3", quantity: 100 },
  { ticket: "RADL3", quantity: 100 },
  { ticket: "MRVE3", quantity: 100 },
  { ticket: "ENEV3", quantity: 100 },
  { ticket: "SMFT3", quantity: 100 },
  { ticket: "VAMO3", quantity: 100 },
  { ticket: "BEEF3", quantity: 100 },
  { ticket: "ALOS3", quantity: 100 },
  { ticket: "CXSE3", quantity: 100 },
  { ticket: "CSMG3", quantity: 100 },
  { ticket: "BBDC3", quantity: 100 },
  { ticket: "VIVA3", quantity: 100 },
  { ticket: "DIRR3", quantity: 100 },
  { ticket: "SRNA3", quantity: 100 },
  { ticket: "CSNA3", quantity: 100 },
  { ticket: "AURE3", quantity: 100 },
  { ticket: "GMAT3", quantity: 100 },
  { ticket: "CPFE3", quantity: 100 },
  { ticket: "CEAB3", quantity: 100 },
  { ticket: "EGIE3", quantity: 100 },
  { ticket: "FLRY3", quantity: 100 },
  { ticket: "MOVI3", quantity: 100 },
  { ticket: "CURY3", quantity: 100 },
  { ticket: "AMBP3", quantity: 100 },
  { ticket: "AZZA3", quantity: 100 },
];

type TicketSuggestionType = {
  ticket: string;
  quantity: number;
};

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useInvestmentsViewModel() {
  const investmentRepository = useDI().resolve(TOKENS.InvestmentRepository);
  const quoteRepository = useDI().resolve(TOKENS.QuoteRepository);
  const { user } = useAuthViewModel();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] =
    useState<TicketSuggestionType[]>(TICKETS);
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay

  // Effect for fetching suggestions
  useEffect(() => {
    if (debouncedSearchQuery?.length > 0) {
      setSuggestions(
        TICKETS.filter((item) =>
          item.ticket.toUpperCase().includes(debouncedSearchQuery.toUpperCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery, searchQuery]);

  const fetchInvestments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const portfolio = await investmentRepository.listByUser(user.id);
      const enrichedInvestments = await Promise.all(
        portfolio.map(async (ownedInvestment) => {
          const quote = await quoteRepository.getQuote(ownedInvestment.id);
          return {
            ...ownedInvestment,
            longName: quote?.longName ?? ownedInvestment.id,
            regularMarketPrice: quote?.regularMarketPrice,
            regularMarketChangePercent: quote?.regularMarketChangePercent,
            logoUrl: quote?.logoUrl,
          };
        })
      );
      setInvestments(enrichedInvestments);
    } catch (e) {
      console.error("Failed to fetch investments:", e);
      setError("Não foi possível carregar seus investimentos.");
    } finally {
      setIsLoading(false);
    }
  }, [investmentRepository, quoteRepository, user]);

  const addInvestment = async ({ ticker, quantity }: AddInvestimentInput) => {
    if (!user) return;
    if (!ticker) {
      setError("Formato do ticker inválido. Ex: PETR4");
      return;
    }

    setIsLoading(true);
    try {
      await investmentRepository.save(user.id, {
        id: ticker.toUpperCase(),
        quantity,
      });
      await fetchInvestments();
    } catch (e) {
      console.error("Failed to add investment:", e);
      setError("Não foi possível adicionar o investimento.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeInvestment = async (ticker: string) => {
    if (!user) return;

    Alert.alert(
      "Remover Investimento",
      `Tem certeza que deseja remover ${ticker} da sua carteira?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await investmentRepository.delete(user.id, ticker);
              await fetchInvestments();
            } catch (e) {
              console.error("Failed to remove investment:", e);
              setError("Não foi possível remover o investimento.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return {
    investments,
    isLoading,
    error,
    fetchInvestments,
    addInvestment,
    removeInvestment,
    // Autocomplete props
    searchQuery,
    setSearchQuery,
    suggestions,
    setSuggestions,
    ticketsSugestions: TICKETS,
  };
}
