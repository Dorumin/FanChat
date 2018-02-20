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

export default class PrivateChat extends React.Component {
    render() {
        const { users, chat, messages, config, onPress, onLongPress } = this.props,
        members = chat.users.filter(n => n != chat.username),
        user = users[members[0]];
        if (!user) return null;
        return (
            <Touchable
                style={{
                    borderBottomColor: '#ccc',
                    justifyContent: 'center',
                    borderBottomWidth: 1,
                    height: 80,
                    opacity: chat.parent && chat.parent.users.includes(user.name) ? 1 : .5
                }}
                onPress={() => onPress(chat)}
                onLongPress={() => onLongPress(chat)}
                background={Touchable.Ripple('#eef')}
                delayPressIn={0}
                activeOpacity={1}
            >
                <View
                    pointerEvents='box-only'
                    style={{
                        height: 80
                    }}
                >
                    <View
                        style={{
                            height: 50,
                            width: 50,
                            borderRadius: 25,
                            margin: 15,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <Image
                            source={{
                                uri: user.avatar
                            }}
                            style={{
                                height: 50,
                                width: 50
                            }}
                        />
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            paddingTop: 10,
                            height: 80,
                            left: 80,
                            right: 0
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 20
                            }}
                            numberOfLines={1}
                        >
                            {user.name}
                        </Text>
                    </View>
                    <MessagePreview
                        chat={chat}
                        config={config}
                        messages={messages}
                        style={{
                            left: 80
                        }}
                    />
                </View>
            </Touchable>
        )
    }
}