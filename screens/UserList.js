import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { switchChat } from '../actions';
import Touchable from 'react-native-platform-touchable';
import User from '../components/User';
import Popout from '../components/Popout';
import PrivateChat from '../components/PrivateChat';

class UserList extends React.Component {
    state = {
        selected: null
    };

    onPress(user) {
        this.setState({
            selected: user
        });
    }

    onPrivate(chat) {
        const { switchChat, navigation } = this.props;

        switchChat(chat.key);
        navigation.navigate('Messages');
    }

    onLongPrivate(chat) {
        const { users, session } = this.props;
        this.setState({
            selected: users[chat.users.filter(u => u != session.name)[0]]
        });
    }

    onClose() {
        this.setState({ selected: null });
    }

    render() {
        const { chats, chat, messages, users, session, config, navigation } = this.props,
        { selected } = this.state,
        parent = chat.parent || chat,
        userModels = Object.values(users)
            .filter(user =>
                user.name != session.name &&
                parent.users.includes(user.name) &&
                ( // Not currently in a PM and unblocked
                    session.blocked.includes(user.name) ||
                    !parent.privates.some(users => users.length == 1 && users.includes(user.name))
                )
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(user =>
                <User
                    user={user}
                    key={user.name}
                    onPress={this.onPress.bind(this)}
                    onLongPress={this.onPress.bind(this)}
                />
            ),
        privateChats = parent.privates
            .filter(users => users.length == 1 && !session.blocked.includes(users[0]))
            .map(users => chats[`${session.id}/${chat.code}/${users.join('|')}`])
            .filter(Boolean) // I forgot why I put this here but it doesn't hurt anyone so
            .sort((a, b) => {
                const au = a.users.filter(n => n != session.name),
                bu = b.users.filter(n => n != session.name);
                if (!au.length) return 1;
                if (!bu.length) return -1;
                return bu.length - au.length || au[0].localeCompare(bu[0]);
            })
            .map(chat =>
                <PrivateChat
                    users={users}
                    chat={chat}
                    messages={messages}
                    config={config}
                    key={chat.users.join('|')}
                    onPress={this.onPrivate.bind(this)}
                    onLongPress={this.onLongPrivate.bind(this)}
                />
            );
        return (
            <View
                style={{
                    flex: 1
                }}
            >
                <ScrollView
                    style={{
                        marginBottom: 60
                    }}
                >
                    {!!privateChats.length &&
                        privateChats
                    }
                    {userModels}
                </ScrollView>
                <Popout
                    user={selected}
                    chat={parent}
                    session={session}
                    config={config}
                    onClose={this.onClose.bind(this)}
                    navigation={navigation}
                />
            </View>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            switchChat: wiki => dispatch(switchChat(wiki))
        }
    }
)(UserList);