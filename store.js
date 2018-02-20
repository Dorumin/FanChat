import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['models', 'config'],
    transforms: [
        createTransform(
            (inboundState, key) => {
                if (key == 'config') {
                    return inboundState;
                }
                const state = Object.assign({}, inboundState, {
                    chats: {}
                }),
                chats = inboundState.chats;
                for (const key in chats) {
                    const chat = state.chats[key] = Object.assign({}, chats[key]);
                    chat.connecting = false;
                    chat.connected = false;
                    delete chat.socket;
                    delete chat.parent;
                }
                return state;
            }
        )
    ]
}

export default function configureStore(preloadedState) {
    const store = createStore(
        persistReducer(
            persistConfig,
            rootReducer
        ),
        preloadedState,
        applyMiddleware(
            thunkMiddleware
        )
    ),
    persistor = persistStore(store);
    return {
        store,
        persistor
    }
}