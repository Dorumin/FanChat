import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';

export default class UsersPreview extends React.Component {
    shouldComponentUpdate(nextProps) {
        if (!this.props.users || !nextProps.users) return true;
        return this.props.users.map(u => u.username).sort().join('|') != nextProps.users.map(u => u.username).sort().join('|');
    }

    render() {
        const { users, chat, onPress } = this.props,
        avatars = users
            .map(user => {
                return (
                    <TouchableWithoutFeedback
                        key={user.username}
                        onPress={() => !chat.connecting && onPress(user)}
                        disable={chat.connecting}
                    >
                        <View
                            key={user.username}
                            style={{
                                height: 40,
                                minWidth: 40,
                                borderRadius: 20,
                                overflow: 'hidden',
                                marginTop: 15,
                                marginHorizontal: 10
                            }}
                        >
                            <Image
                                source={{
                                    uri: user.avatarUrl
                                }}
                                style={{
                                    height: 40,
                                    width: 40
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                )
            });
        return (
            <View
                style={{
                    marginTop: 10,
                    width: '100%',
                    alignItems: 'center'
                }}
            >
                <Text>{avatars.length} {avatars.length == 1 ? 'user' : 'users'} online</Text>
                <ScrollView
                    style={{
                        height: 80,
                        width: '80%'
                    }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center'
                    }}
                    horizontal={true}
                >
                    {avatars}
                </ScrollView>
            </View>
        )
    }
}