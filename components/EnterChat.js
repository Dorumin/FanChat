import React from 'react';
import {
    View,
    Text,
    Button,
    Image,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import { joinChat } from '../actions';
import UsersPreview from './UsersPreview';

class EnterChat extends React.Component {
    render() {
        const { chat, onPress, joinChat } = this.props,
        last = chat.messages[chat.messages.length - 1],
        users = chat.variables.wgWikiaChatUsers
            .filter(user => user.username != chat.username);
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    opacity: chat.connecting ? .5 : 1
                }}
            >
                <View
                    style={{
                        backgroundColor: last ? '#ccc' : '#fff',
                        height: 1,
                        width: '50%',
                        marginBottom: 20
                    }}
                />
                <Text
                    style={{
                        fontSize: 24,
                        textAlign: 'center'
                    }}
                >
                    Join&nbsp;
                    <Text
                        style={{
                            fontWeight: '500'
                        }}
                    >
                        {chat.name}
                    </Text>
                    &nbsp;chat
                </Text>
                {users.length ?
                    <UsersPreview
                        users={users}
                        chat={chat}
                        onPress={onPress}
                    /> :
                    <Text>No users online.</Text>
                }
                <View
                    style={{
                        marginTop: 20,
                        marginBottom: 100
                    }}
                >
                    <Button
                        title='Join chat'
                        onPress={() => joinChat(chat.code)}
                        style={{
                            opacity: chat.banned ? .5 : 1 /* chat.connecting purposefully ommited, KOCKA */
                        }}
                        disabled={chat.banned || chat.connecting}
                    />
                    {
                        chat.blocked && <Text style={{ color: '#666' }}>You are blocked on this community.</Text> ||
                        chat.banned && <Text style={{ color: '#666' }}>You are banned from this chat.</Text>
                    }
                </View>
            </View>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            joinChat: wiki => dispatch(joinChat(wiki))
        }
    }
)(EnterChat);