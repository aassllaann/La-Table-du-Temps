'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Dish, EraId, AppState } from './types';

type Action =
  | { type: 'SET_ERA'; payload: EraId | null }
  | { type: 'SET_DISH'; payload: Dish | null }
  | { type: 'HIDE_REMY' }
  | { type: 'TOGGLE_SENSORY' };

const initialState: AppState = {
  selectedEra: null,
  selectedDish: null,
  remyVisible: false,
  remySensoryOpen: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ERA':
      return {
        ...state,
        selectedEra: action.payload,
        selectedDish: null,
        remyVisible: action.payload !== null,
        remySensoryOpen: false,
      };
    case 'SET_DISH':
      return { ...state, selectedDish: action.payload, remySensoryOpen: false };
    case 'HIDE_REMY':
      return { ...state, remyVisible: false };
    case 'TOGGLE_SENSORY':
      return { ...state, remySensoryOpen: !state.remySensoryOpen };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function useSelectedEra() {
  return useAppContext().state.selectedEra;
}

export function useSelectedDish() {
  return useAppContext().state.selectedDish;
}

export function useRemyVisible() {
  return useAppContext().state.remyVisible;
}

export function useRemySensoryOpen() {
  return useAppContext().state.remySensoryOpen;
}

export function useAppDispatch() {
  return useAppContext().dispatch;
}
