import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from '../store';
import FanChat from './app';
import LoadingScreen from '../screens/LoadingScreen';

const { store, persistor } = configureStore();

global.PERSISTOR = persistor;

export default class Root extends Component {
    render() {
        return (
            <Provider
                store={store}
            >
                <PersistGate
                    loading={<LoadingScreen />}
                    persistor={persistor}
                >
                    <FanChat />
                </PersistGate>
            </Provider>
        )
    }
}