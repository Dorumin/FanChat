import React from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    Animated,
    ScrollView,
    KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';
import { switchChat, hideChat, removeChat, fetchChat } from '../actions';
import Touchable from 'react-native-platform-touchable';
import Chat from '../components/Chat';

class Chats extends React.Component {
    state = {
        progress: new Animated.Value(0),
        choosing: false,
        selected: {}
    };

    clearSelection() {
        this.setState({
            choosing: false,
            selected: {}
        });
        Animated.spring(this.state.progress, {
            toValue: 0,
            duration: 300
        }).start();
    }

    selectWiki(wiki) {
        const progress = new Animated.Value(0);
        this.setState({
            choosing: true,
            selected: Object.assign({}, this.state.selected, {
                [wiki]: {
                    selected: true,
                    wiki,
                    progress
                }
            })
        });
        Animated.timing(progress, {
            toValue: 1,
            duration: 300
        }).start();
    }

    onPress(wiki, count) {
        const { navigation, switchChat, fetchChat } = this.props,
        selected = Object.assign({}, this.state.selected);
        if (this.state.choosing) {
            const selection = selected[wiki];
            if (selection) {
                selection.selected = !selection.selected;
                const n = Number(selection.selected);
                selection.progress = new Animated.Value(n ? 0 : 1);
                Animated.timing(selection.progress, {
                    toValue: n,
                    duration: 300
                }).start();
                if (Object.values(selected).some(chat => chat.selected)) {
                    this.setState({
                        selected: Object.assign({}, selected, {
                            [wiki]: selection
                        })
                    });
                } else {
                    this.clearSelection();
                }
            } else {
                this.selectWiki(wiki);
            }
        } else {
            fetchChat(wiki, true);
            switchChat(wiki);
            navigation.navigate(count ? 'Users' : 'Messages');
        }
    }

    onLongPress(wiki) {
        const selected = Object.assign({}, this.state.selected);
        if (this.state.choosing) {
            const selection = selected[wiki];
            if (selection) {
                selection.selected = !selection.selected;
                
                if (Object.values(selected).some(chat => chat.selected)) {
                    this.setState({
                        selected: Object.assign({}, selected, {
                            [wiki]: selection
                        })
                    });
                } else {
                    this.clearSelection();
                }
            } else {
                this.selectWiki(wiki);
            }
            return;
        }
        Animated.spring(this.state.progress, {
            toValue: 1,
            duration: 300
        }).start();
        this.selectWiki(wiki);
    }

    newChatPress() {
        const { navigation } = this.props;
        if (this.state.choosing) {
            Animated.spring(this.state.progress, {
                toValue: 0,
                duration: 300
            }).start();
            this.setState({
                choosing: false,
                selected: []
            });
        } else {
            navigation.navigate('NewChatModal');
        }
    }

    hideChats(chats) {
        chats.forEach(chat => this.props.hideChat(chat.wiki));
        this.clearSelection();
    }

    removeChats(chats) {
        chats.forEach(chat => this.props.removeChat(chat.wiki));
        this.clearSelection();
    }

    prompt() {
        if (!this.state.choosing) return;
        const chats = Object.values(this.state.selected).filter(chat => chat.selected);
        Alert.alert(
            'Are you sure?',
            `This will delete all logs from ${chats.length} ${chats.length == 1 ? 'chat' : 'chats'}!`,
            [
                {text: 'Cancel', onPress: this.clearSelection.bind(this), style: 'cancel'},
                {text: 'Hide and keep history', onPress: () => this.hideChats(chats)},
                {text: 'Delete channel logs', onPress: () => this.removeChats(chats)},
            ]
        )
    }

    render() {
        const { chats, messages, session, config, navigation, switchChat } = this.props,
        { progress, selected } = this.state,
        chatList = Object.values(chats)
            .filter(chat => chat.name && !chat.hidden && chat.userid == session.id && !chat.private)
            .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
            .map(chat => Object.assign({}, chat, {
                privateChats: Object.values(chats)
                    .filter(pchat => pchat.private && pchat.connected && pchat.parent == chat)
            })),
        chatViews = chatList.map(chat => {
            return (
                <Chat
                    chat={chat}
                    privates={chat.privateChats}
                    key={chat.key}
                    messages={messages}
                    config={config}
                    navigation={navigation}
                    selected={selected}
                    onPress={this.onPress.bind(this)}
                    onLongPress={this.onLongPress.bind(this)}
                />
            )
        });

        return (
            <View
                style={{
                    backgroundColor: '#fff',
                    flex: 1
                }}
            >
                <View
                    style={{
                        height: 1,
                        width: '100%',
                        left: 60,
                        backgroundColor: '#ccc'
                    }}
                />
                {!!chatViews.length && 
                    <ScrollView>
                        {chatViews}
                    </ScrollView>
                }
                <Animated.View
                    style={{
                        position: 'absolute',
                        overflow: 'hidden',
                        bottom: 30,
                        right: 120,
                        borderRadius: 30,
                        transform: [{
                            scale: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [.01, 1],
                                extrapolate: 'clamp'
                            })
                        }]
                    }}
                >
                    <Touchable
                        onPress={this.prompt.bind(this)}
                        background={Touchable.Ripple('#0096ff')}
                        activeOpacity={.9}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#268bd2',
                            height: 60,
                            width: 60
                        }}
                    >
                        <Image
                            source={require('../img/bin.png')}
                            style={{
                                height: 25,
                                width: 25
                            }}
                        />
                    </Touchable>
                </Animated.View>
                <Animated.View
                    style={{
                        position: 'absolute',
                        overflow: 'hidden',
                        bottom: 30,
                        right: 30,
                        borderRadius: 30,
                        transform: [{
                            rotate: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '45deg']
                            })
                        }]
                    }}
                >
                    <Touchable
                        onPress={this.newChatPress.bind(this)}
                        background={Touchable.Ripple('#0096ff')}
                        activeOpacity={.6}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#268bd2',
                            height: 60,
                            width: 60
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 32,
                                fontWeight: '500'
                            }}
                        >
                            +
                        </Text>
                    </Touchable>
                </Animated.View>
            </View>
        )
    }
}

export default connect(
    state => {
        return {
            chats: state.models.chats,
            messages: state.models.messages,
            session: state.session,
            config: state.config[state.session.id]
        };
    },
    dispatch => {
        return {
            switchChat: wiki => dispatch(switchChat(wiki)),
            fetchChat: wiki => dispatch(fetchChat(wiki)),
            hideChat: wiki => dispatch(hideChat(wiki)),
            removeChat: wiki => dispatch(removeChat(wiki))
        }
    }
)(Chats);
