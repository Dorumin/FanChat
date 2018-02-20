import React from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    Keyboard,
    Animated,
    TouchableOpacity
} from 'react-native';
import { Constants, ScreenOrientation } from 'expo';
import { connect } from 'react-redux';
import { leaveChat, switchChat, acknowledge } from '../actions';
import NavIcon from './NavIcon';
import Wordmark from './Wordmark';
import ShyView from '../components/ShyView';

const isNotNaN = n => !isNaN(n);

class Navigation extends React.Component {
    state = {
        typing: false,
        height: new Animated.Value(1)
    };

    componentDidMount() {
        this.showListener = Keyboard.addListener('keyboardDidShow', () => {
            Animated.timing(this.state.height, {
                toValue: 0,
                duration: 250
            }).start();
            this.setState({
                typing: true
            });
        });
        this.hideListener = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(this.state.height, {
                toValue: 1,
                duration: 250
            }).start();
            this.setState({
                typing: false
            });
        });
        const { config } = this.props;

        if (config.landscape) {
            ScreenOrientation.allow(ScreenOrientation.Orientation.ALL_BUT_UPSIDE_DOWN);
        } else {
            ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT_UP)
        }
    }

    componentWillUnmount() {
      this.showListener.remove();
      this.hideListener.remove();
    }

    componentDidUpdate() {
        const { currentChat, chats, session, navigation, acknowledge } = this.props,
        current = chats[session.id + '/' + currentChat] || {},
        parent = current.parent || current,
        index = navigation.state.index;

        switch (index) {
            case 0: // Chat list
                Object.values(chats)
                    .filter(chat => !chat.private && (!parent.key || chat.key != parent.key))
                    .map(chat => chat.key)
                    .forEach(acknowledge);
                break;
            case 1: // Messages
                if (current) {
                    acknowledge(current.key);
                }
                break;
            case 2: // User list
                Object.values(chats)
                    .filter(chat => chat.private && chat.parent == parent)
                    .map(chat => chat.key)
                    .forEach(acknowledge);
                break;
        }
    }

    toMessages() {
        const { currentChat, chats, session, navigation, leaveChat, switchChat } = this.props,
        moved = navigation.navigate('Messages'),
        chat = chats[session.id + '/' + currentChat];
        if (!moved && chat && chat.parent) {
            switchChat(chat.parent.key);
        } else if (!moved && chat && chat.connected) {
            Alert.alert(
                'Do you wish to leave the chat?',
                'Chat logs will not be lost.',
                [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'OK', onPress: () => leaveChat(currentChat)}
                ]
            )
        }
    }

    count(list, filter) {
        return list
            .filter(filter)
            .reduce((count, chat) => {
                if (!chat.messages) return count;
                const messages = chat.messages.filter(isNotNaN);
                return count + messages.length - messages.indexOf(chat.acknowledged) - 1;
            }, 0);
    }

    render() {
        const { currentChat, chats, session, config, navigation } = this.props,
        current = chats[session.id + '/' + currentChat] || {},
        parent = current.parent || current,
        messages = parent.messages && parent.messages.filter(isNotNaN),
        index = navigation.state.index,
        chatList = Object.values(chats),
        unreadLocalCount = messages ? messages.length - messages.indexOf(parent.acknowledged) - 1 : 0,
        unreadLocalPMCount = this.count(chatList, chat => chat.private && chat.connected && chat.parent == parent),
        unreadGlobalCount = this.count(chatList, chat => chat.private && chat.connected && chat.parent != parent),
        unreadInUnfocusedChats = chatList
            .filter(chat => !chat.private && chat.connected && chat.messages && chat != parent)
            .some(chat => {
                const messages = chat.messages.filter(isNotNaN);
                return messages.length - messages.indexOf(chat.acknowledged) - 1;
            });
        return (
            <Animated.View
                style={{
                    flex: 0,
                    height: (config.slidenav ? this.state.height.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 60 + Constants.statusBarHeight],
                        extrapolate: 'clamp'
                    }) : 60 + Constants.statusBarHeight),
                    paddingTop: Constants.statusBarHeight,
                    flexDirection: 'row',
                    backgroundColor: '#fff'
                }}
            >
                <View>
                    <NavIcon
                        source={require('../img/wikis.png')}
                        style={{
                            width: 40,
                            height: 40,
                            margin: 10
                        }}
                        onPress={() => navigation.navigate('Chats')}
                    />
                    {!!(unreadInUnfocusedChats || !!unreadGlobalCount) &&
                        <View
                            style={{
                                backgroundColor: 'red',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'flex-end',
                                bottom: 24,
                                height: 16,
                                minWidth: 16,
                                borderRadius: 8,
                                right: 4
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontWeight: '500',
                                    fontSize: unreadGlobalCount ? 14 : 24
                                }}
                            >
                                {unreadGlobalCount || '•'}
                            </Text>
                        </View>
                    }
                </View>
                <View
                    style={{
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: '#ccc',
                        borderRightWidth: 1,
                        borderLeftWidth: 1,
                        right: 60,
                        left: 60,
                        top: Constants.statusBarHeight,
                        bottom: 0
                    }}
                >
                    <TouchableOpacity
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                        onPress={this.toMessages.bind(this)}
                    >
                        <View
                            style={{
                                justifyContent: 'center',
                                height: '100%',
                                paddingHorizontal: 10
                            }}
                        >
                            <Wordmark
                                wiki={current.key}
                                onPress={this.toMessages.bind(this)}
                            />
                            {!!unreadLocalCount &&
                                <View
                                    style={{
                                        position: 'absolute',
                                        backgroundColor: 'red',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignSelf: 'flex-end',
                                        height: 16,
                                        minWidth: 16,
                                        bottom: 10,
                                        right: 10,
                                        borderRadius: 8
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontWeight: '500',
                                            fontSize: 14
                                        }}
                                    >
                                        {unreadLocalCount}
                                    </Text>
                                </View>
                            }
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        position: 'absolute',
                        top: Constants.statusBarHeight,
                        right: 0
                    }}
                >
                    <NavIcon
                        source={require('../img/users.png')}
                        style={{
                            width: 40,
                            height: 40,
                            margin: 10
                        }}
                        onPress={() => navigation.navigate('Users')}
                    />
                    {!!unreadLocalPMCount &&
                        <View
                            style={{
                                backgroundColor: 'red',
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'flex-end',
                                bottom: 24,
                                height: 16,
                                minWidth: 16,
                                right: 8,
                                borderRadius: 8
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontWeight: '500',
                                    fontSize: 14
                                }}
                            >
                                {unreadLocalPMCount}
                            </Text>
                        </View>
                    }
                </View>
            </Animated.View>
        )
    }
}

export default connect(
    state => {
        return {
            currentChat: state.currentChat,
            chats: state.models.chats,
            session: state.session,
            config: state.config[state.session.id]
        }
    },
    dispatch => {
        return {
            leaveChat: wiki => dispatch(leaveChat(wiki)),
            switchChat: wiki => dispatch(switchChat(wiki)),
            acknowledge: wiki => dispatch(acknowledge(wiki))
        }
    }
)(Navigation);