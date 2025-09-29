import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";
import { Button } from "@components/Button";
import { useFadeSlideInOnFocus } from "../../hooks/animations";
import { goToLogin } from "../../navigation/navigationUtils";
import { useTheme } from "@presentation/theme/theme";
import { makeOnboardingStyles } from "./OnboardingScreen.styles";
import { useI18n } from "@presentation/i18n/I18nProvider";

const { width } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  image: any;
};

export const OnboardingScreen: React.FC<any> = ({ navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeOnboardingStyles(theme), [theme]);
  const { t } = useI18n();
  const slides: Slide[] = useMemo(
    () => [
      {
        key: "secure-banking",
        title: t("onboarding.slides.secureBanking.title"),
        subtitle: t("onboarding.slides.secureBanking.subtitle"),
        image: require("../../../../public/assets/images/banners/home.png"),
      },
      {
        key: "insights",
        title: t("onboarding.slides.insights.title"),
        subtitle: t("onboarding.slides.insights.subtitle"),
        image: require("../../../../public/assets/images/icons/Gráfico pizza.png"),
      },
      {
        key: "login",
        title: t("onboarding.slides.login.title"),
        subtitle: t("onboarding.slides.login.subtitle"),
        image: require("../../../../public/assets/images/banners/login.png"),
      },
    ],
    [t]
  );

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { animatedStyle } = useFadeSlideInOnFocus();
  const dotScales = useRef(slides.map(() => new Animated.Value(0))).current; // 0: inactive, 1: active

  useEffect(() => {
    dotScales.forEach((v, i) => {
      Animated.spring(v, {
        toValue: i === index ? 1 : 0,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }).start();
    });
  }, [index, dotScales]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    const next = Math.min(index + 1, slides.length - 1);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };

  const finish = () => {
    // Usa reset para evitar voltar ao onboarding; funciona em Stack/Tab
    goToLogin(navigation);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle as any]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        {slides.map((s) => (
          <View key={s.key} style={[styles.slide, { width }]}>
            <Image source={s.image} style={styles.image} />
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.subtitle}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === index ? styles.dotActive : null,
                {
                  transform: [
                    {
                      scale: dotScales[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.25],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.actions}>
          {index < slides.length - 1 ? (
            <>
              <Button title={t("onboarding.skip")} onPress={finish} />
              <View style={styles.spacer} />
              <Button title={t("onboarding.next")} onPress={goNext} />
            </>
          ) : (
            <Button title={t("onboarding.getStarted")} onPress={finish} />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// styles moved to OnboardingScreen.styles.ts
