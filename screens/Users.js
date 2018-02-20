import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';
import UserList from './UserList';
import NoChatSelected from './NoChatSelected';
import UserMain from '../components/UserMain';

class Users extends React.Component {
    render() {
        const { chats, users, messages, session, config, currentChat, navigation } = this.props,
        chat = chats[session.id + '/' + currentChat];
        return (
            <KeyboardAvoidingView
                behavior='padding'
                style={{
                    flex: 1
                }}
            >
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
                            right: 60,
                            backgroundColor: '#ccc'
                        }}
                    />
                    {
                        chat && chat.connected && (chat.users.length > 1 || chat.privates.length) ? (
                            <UserList
                                chats={chats}
                                chat={chat}
                                users={users}
                                messages={messages}
                                session={session}
                                config={config}
                                navigation={navigation}
                            />
                        ) : (
                            <NoChatSelected
                                message={
                                    chat ? 
                                        (
                                            chat.connected ? 'There are no other users online' : 'Join chat to see connected users'
                                        ) 
                                    :
                                        'Select a chat to see users here!'
                                }
                            />
                        )
                    }
                    <UserMain session={session} navigation={navigation} />
                </View>
            </KeyboardAvoidingView>
        )
    }
}

export default connect(
    state => {
        return {
            chats: state.models.chats,
            users: state.models.users,
            messages: state.models.messages,
            session: state.session,
            config: state.config[state.session.id],
            currentChat: state.currentChat
        };
    }
)(Users);