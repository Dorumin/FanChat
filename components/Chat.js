import React from 'react';
import {
    View,
    Text,
    Image,
    Animated
} from 'react-native';
import { connect } from 'react-redux';
import { switchChat } from '../actions';
import Touchable from 'react-native-platform-touchable';
import MessagePreview from './MessagePreview';
import FullHeightImage from './FullHeightImage';

export default class Chat extends React.Component {
    render() {
        const { chat, privates, messages, selected, config, onPress, onLongPress } = this.props,
        wiki = chat.key,
        chosen = selected[wiki] && selected[wiki].selected,
        unreadPrivateCount = privates.reduce((count, chat) => {
            const messages = chat.messages.filter(key => !isNaN(key));
            return count + messages.length - messages.indexOf(chat.acknowledged) - 1;
        }, 0);
        return (
            <Animated.View
                style={{
                    backgroundColor: selected[wiki] ? selected[wiki].progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255, 0, 0, 0)', 'rgba(255, 0, 0, .15)']
                    }) : '#fff'
                }}
            >
                <Touchable
                    onPress={() => onPress(wiki, unreadPrivateCount)}
                    onLongPress={() => onLongPress(wiki)}
                    background={Touchable.Ripple(chosen ? '#fcc' : '#eef')}
                >
                    <View
                        style={{
                            height: 80,
                            width: '100%',
                            flexDirection: 'row'
                        }}
                    >
                        <View
                            style={{
                                marginLeft: 10,
                                marginRight: 20,
                                borderBottomWidth: 1,
                                borderBottomColor: '#ccc',
                                flexGrow: 1
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 20,
                                    marginTop: 6
                                }}
                            >
                                {chat.name}
                            </Text>
                            <MessagePreview
                                chat={chat}
                                config={config}
                                count={unreadPrivateCount}
                                messages={messages}
                            />
                            {!!chat.wordmark &&
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        minWidth: 160,
                                        height: 80,
                                        top: 0,
                                        right: 0,
                                        opacity: .2
                                    }}
                                >
                                    <FullHeightImage
                                        source={{
                                            uri: chat.wordmark
                                        }}
                                        height={40}
                                    />
                                </View>
                            }
                        </View>
                    </View>
                </Touchable>
            </Animated.View>
        )
    }
}