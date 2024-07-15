import storage from 'redux-persist/lib/storage';
import { persistReducer, PersistConfig } from 'redux-persist';
import rootReducer from './rootReducer';

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  storage,
  whitelist: ['auth', 'basket', 'orders'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
