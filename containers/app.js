import React from 'react';
import { AppState } from 'react-native';
import { SecureStore, ScreenOrientation } from 'expo';
import { connect } from 'react-redux';
import { attemptLogin, fetchChat, refreshChats } from '../actions';
import Login from './login';
import LoadingScreen from '../screens/LoadingScreen';
import Main from './main';

class FanChat extends React.Component {
    constructor(props) {
        super(props);
        this.lastId = null;
        this.state = {
            load: 0,
            appState: AppState.currentState
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onAppStateChange);
    }
  
    componentWillUnmount() {
        AppState.removeEventListener('change', this.onAppStateChange);
    }
  
    onAppStateChange = (appState) => {
        if (this.state.appState.match(/inactive|background/) && appState === 'active') {
            this.props.refresh();
        }

        this.setState({ appState });
    }

    componentDidUpdate() {
        const { session, chats, fetchChat } = this.props,
        keys = Object.keys(chats).filter(s => s.startsWith(session.id + '/') && s.split('/').length == 2);

        if (!session.loggedIn) {
            if (this.state.load == 3) {
                this.setState({ load: 2 });
            }
            return;
        }

        if (this.state.load != 2) return;
        
        this.setState({ load: 3 });

        if (keys.length) {
            keys.forEach(fetchChat);
        } else {
            fetchChat('community'); // Provide a starting point for newbs
        }
    }

    render() {
        const s = this.state;
        const { session, attemptLogin } = this.props;
        
        if (s.load < 2) {
            if (s.load == 1 && !session.processing) {
                SecureStore.getItemAsync('login').then(loginfo => {
                    if (!loginfo || session.failed || session.loggedIn) return this.setState({ load: 2 });
                    const i = loginfo.indexOf('|'),
                    name = loginfo.slice(0, i),
                    pass = loginfo.slice(i + 1);
                    attemptLogin(name, pass);
                });
            }
            return (
                <LoadingScreen
                    onLoadEnd={() => this.setState({ load: s.load ? s.load : 1 })}
                />
            )
        }

        if (session.processing || !session.loggedIn || session.failed) {
            return (
                <Login />
            );
        }

        return (
            <Main />
        );
    }
}

export default connect(
    state => {
        return {
            session: state.session,
            chats: state.models.chats,
            config: state.config
        }
    },
    dispatch => {
        return {
            attemptLogin: (name, pass) => dispatch(attemptLogin(name, pass)),
            fetchChat: wiki => dispatch(fetchChat(wiki)),
            refresh: () => dispatch(refreshChats())
        }
    }
)(FanChat);