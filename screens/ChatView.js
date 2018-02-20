import React from 'react';
import {
    View,
    Text,
    Image,
    Animated,
    Platform,
    FlatList,
    ToastAndroid
} from 'react-native';
import Touchable from 'react-native-platform-touchable';
import Popout from '../components/Popout';
import Message from '../components/Message';
import EnterChat from '../components/EnterChat';
import InlineAlert from '../components/InlineAlert';
import MessageInput from '../components/MessageInput';

export default class ChatView extends React.Component {
    constructor(props) {
        super(props);

        this.chat = '';
        this.bottom = 0;
        this.height = 0;
        this.lastSize = props.chat.messages.length;
        this.lastBottom = 0;
        this.state = {
            scale: new Animated.Value(0),
            start: 50,
            last: 0,
            backToBottomVisible: false,
            user: null,
            message: null
        };
    }

    componentWillReceiveProps(props) {
        if (props.chat.key != this.chat) {
            this.chat = props.chat.key;
            this.bottom = 0;
            this.height = 0;
            this.lastSize = props.chat.messages.length;
            this.lastBottom = 0;
            this.setState({
                start: 50,
                last: 0,
                backToBottomVisible: false,
                user: null,
                message: null
            });
            Animated.timing(this.state.scale, {
                toValue: 0,
                duration: 1
            }).start();
        }
    }

    onPress(user) {
        const { chat, users } = this.props;
        this.setState({
            user: users[user.username] ? 
                Object.assign({}, users[user.username], {
                    avatar: user.avatarUrl.replace(/50(?!.*50)/, '150')
                })
            : {
                temp: true,
                avatar: user.avatarUrl.replace(/50(?!.*50)/, '150'),
                name: user.username,
                groups: {
                    [chat.code]: {
                        mod: false,
                        admin: false,
                        staff: false
                    }
                }
            }
        });
    }

    onLongPress(message, user) {
        this.setState({
            message,
            user
        });
    }

    _renderItem(item) {
        const { users, messages, config, chat } = this.props,
        models = item.item.map(id => messages[id]),
        user = users[models[0].name];
        if (models[0].inline) {
            let i = models.length;
            while (i--) {
                models[i].user = users[models[i].name];
            }
            return (
                <InlineAlert
                    models={models}
                    name={chat.username}
                    chat={chat}
                    config={config}
                    keys={item.item}
                    index={item.index}
                    onLongPress={this.onLongPress.bind(this)}
                />
            )
        }
        return (
            <Message
                messages={models}
                user={user}
                chat={chat}
                config={config}
                keys={item.item}
                index={item.index}
                onLongPress={this.onLongPress.bind(this)}
            />
        )
    }

    _renderFooter() {
        const { chat } = this.props;
        if (chat.connected || chat.private) return null;

        return <EnterChat chat={chat} onPress={this.onPress.bind(this)} />
    }

    componentDidMount() {
        if (this.list) {
            this.list.scrollToEnd({ animated: false });
        }
    }

    onChangeSize(e, h) {
        if (!this.list) return;
        const { chat } = this.props;
        if (this.bottom < 100) {
            this.list.scrollToEnd({ animated: false });
        } else if (chat.messages.length == this.lastSize) {
            const _offset = this.y + h - this.height,
            y = this.y > _offset ? this.y : _offset;
            this.y = y;
            this.list.scrollToOffset({
                offset: y,
                animated: false
            });
        }
        this.lastSize = chat.messages.length;
        this.height = h;
    }
  
    onScroll(event) {
        const { chat } = this.props;
        this.y = event.nativeEvent.contentOffset.y;
        this.bottom = event.nativeEvent.contentSize.height - this.y - event.nativeEvent.layoutMeasurement.height;
        if (
            this.y < 200 &&
            (
                Date.now() - this.state.last > 7500 ||
                Math.abs(this.bottom - this.lastBottom) > 200
            ) && 
            chat.messages.length > this.state.start
        ) {
            this.lastBottom = this.bottom;
            this.setState({
                start: this.state.start + 50,
                last: Date.now()
            });
        } else if (this.bottom > 500 && !this.state.backToBottomVisible) {
            this.setState({
                backToBottomVisible: true
            });
            Animated.timing(this.state.scale, {
                toValue: 1,
                duration: 200
            }).start();
        } else if (this.bottom < 500 && this.state.backToBottomVisible) {
            this.setState({
                backToBottomVisible: false
            });
            Animated.timing(this.state.scale, {
                toValue: 0,
                duration: 200
            }).start();
        }
    }

    onClose() {
        this.setState({
            user: null,
            message: null
        });
    }

    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    render() {
        const { chat, messages, session, config, navigation } = this.props,
        { user, message } = this.state,
        l = chat.messages.length,
        groups = [];
        let i = Math.max(1, chat.messages.length - this.state.start);
        if (chat.messages.length) {
            groups.push([chat.messages[i - 1]]);
        }
        while (i < l) {
            const key = chat.messages[i],
            last = chat.messages[i - 1],
            m1 = messages[key],
            m2 = messages[last];
            if (
                m1.inline && m2.inline ||
                m1.inline == m2.inline &&
                m1.name == m2.name &&
                m1.time - m2.time < 30 * 60 * 1000
            ) {
                groups[groups.length - 1].push(key);
            } else {
                groups.push([key])
            }
            i++;
        }
        return (
            <View
                behavior='padding'
                style={{
                    flex: 1
                }}
            >
                <View
                    style={{
                        flex: 1
                    }}
                >
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <FlatList
                            data={groups}
                            renderItem={this._renderItem.bind(this)}
                            ref={list => this.list = list}
                            keyExtractor={item => item.join('|')}
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onContentSizeChange={this.onChangeSize.bind(this)}
                            onLayout={this.onChangeSize.bind(this)}
                            onScroll={this.onScroll.bind(this)}
                        />
                        {!config.hidebacktobottom &&
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    overflow: 'hidden',
                                    bottom: 20,
                                    right: 20,
                                    borderRadius: 20,
                                    transform: [{
                                        scale: this.state.scale.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [.01, 1],
                                            extrapolate: 'clamp'
                                        })
                                    }]
                                }}
                            >
                                <Touchable
                                    onPress={() => this.list && this.list.scrollToEnd({ animated: false })}
                                    style={{
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <Image
                                        source={require('../img/backtobottom.png')}
                                        style={{
                                            height: 40,
                                            width: 40
                                        }}
                                    />
                                </Touchable>
                            </Animated.View>
                        }
                    </View>
                    <MessageInput
                        chat={chat}
                        disabled={!chat.connected}
                        notconnected={chat.parent && chat.users.length == 2 && !chat.parent.users.includes(chat.users.find(n => n != session.name))}
                    />
                    <Popout
                        user={user}
                        message={message}
                        chat={chat}
                        session={session}
                        config={config}
                        onClose={this.onClose.bind(this)}
                        navigation={navigation}
                    />
                </View>
            </View>
        )
    }
}