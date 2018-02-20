import React from 'react';
import {
    View,
    KeyboardAvoidingView
} from 'react-native';
import { Constants } from 'expo';
import { connect } from 'react-redux';
import ChatView from './ChatView';
import NoChatSelected from './NoChatSelected';

class Messages extends React.Component {
    render() {
        const { chats, users, messages, session, config, currentChat, navigation } = this.props,
        chat = chats[session.id + '/' + currentChat];
        return (
            <KeyboardAvoidingView
                keyboardVerticalOffset={60 + Constants.statusBarHeight}
                behavior='padding'
                style={{
                    backgroundColor: '#fff',
                    flex: 1,
                    borderRightWidth: 1,
                    borderLeftWidth: 1,
                    borderRightColor: '#ccc',
                    borderLeftColor: '#ccc'
                }}
            >
                <View
                    style={{
                        height: 1,
                        width: 60,
                        left: 0,
                        backgroundColor: '#ccc'
                    }}
                />
                <View
                    style={{
                        height: 1,
                        width: 60,
                        right: 0,
                        backgroundColor: '#ccc',
                        position: 'absolute'
                    }}
                />
                {
                    chat ? (
                        <ChatView
                            chat={chat}
                            users={users}
                            messages={messages}
                            session={session}
                            config={config}
                            navigation={navigation}
                        />
                    ) : (
                        <NoChatSelected
                            message='Select a chat to see messages here!'
                        />
                    )
                }
            </KeyboardAvoidingView>
        )
    }
}

export default connect(
    state => {
        return {
            chats: state.models.chats,
            messages: state.models.messages,
            users: state.models.users,
            currentChat: state.currentChat,
            session: state.session,
            config: state.config[state.session.id]
        }
    }
)(Messages);