import Vue from "vue";

const STORAGE_KEY = "theme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

export const themeState = Vue.observable({
  isDark: false,
});

const safeGetStoredTheme = () => {
  if (typeof window === "undefined") return null;

  try {
    const theme = window.localStorage.getItem(STORAGE_KEY);
    return theme === DARK_THEME || theme === LIGHT_THEME ? theme : null;
  } catch (e) {
    return null;
  }
};

const getSystemTheme = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return LIGHT_THEME;
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? DARK_THEME : LIGHT_THEME;
};

const getPreferredTheme = () => safeGetStoredTheme() || getSystemTheme();

const applyTheme = theme => {
  if (typeof document === "undefined") return;

  const isDark = theme === DARK_THEME;
  document.documentElement.classList.toggle(DARK_THEME, isDark);
  themeState.isDark = isDark;
};

const persistTheme = theme => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {}
};

export const getThemeBootstrapScript = () =>
  `(function(){try{var k='${STORAGE_KEY}',d=document.documentElement,m=window.matchMedia&&window.matchMedia('${SYSTEM_THEME_QUERY}').matches,s=localStorage.getItem(k),t=s==='${DARK_THEME}'||s==='${LIGHT_THEME}'?s:(m?'${DARK_THEME}':'${LIGHT_THEME}');d.classList.toggle('${DARK_THEME}',t==='${DARK_THEME}');}catch(e){}})();`;

export const themeMutations = {
  init() {
    applyTheme(getPreferredTheme());
  },
  setTheme(theme) {
    const nextTheme = theme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  },
  toggle() {
    this.setTheme(themeState.isDark ? LIGHT_THEME : DARK_THEME);
  },
};
