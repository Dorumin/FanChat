import React from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    Picker,
    Linking,
    Animated,
    Platform,
    Keyboard,
    Clipboard,
    StatusBar,
    TextInput,
    Dimensions,
    ToastAndroid,
    TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import { kickUser, banUser, joinPrivate, blockPrivate, switchChat } from '../actions';
import Icon from './PopoutIcon';
import Tag from './PopoutTag';

class Popout extends React.Component {
    state = {
        height: Dimensions.get('window').height,
        progress: new Animated.Value(0),
        unbanning: false,
        banning: false,
        reasoning: false,
        time: '1200',
        reason: ''
    };

    componentDidMount() {
        this.mounted = true;
        Dimensions.addEventListener('change', this.onChange);
        this.showListener = Keyboard.addListener('keyboardDidShow', e => this.onChange({ window: Dimensions.get('window') }, e));
        this.hideListener = Keyboard.addListener('keyboardDidHide', () => this.onChange({ window: Dimensions.get('window') }));
        Animated.timing(
            this.state.progress,
            {
                toValue: 1,
                duration: 250
            }
        ).start();
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChange.bind(this));
        this.showListener.remove();
        this.hideListener.remove();
        this.mounted = false;
    }

    componentWillReceiveProps() {
        if (!this.mounted) return;
        if (this.animating) {
            this.props.onClose();
            this.animating = false;
        }
        const progress = new Animated.Value(0);
        this.setState({
            progress,
            height: Dimensions.get('window').height,
            time: '1200',
            reason: '',
            unbanning: false,
            banning: false,
            reasoning: false
        });
        Animated.timing(
            progress,
            {
                toValue: 1,
                duration: 250
            }
        ).start();
    }

    dismiss() {
        const { onClose } = this.props;
        Animated.timing(
            this.state.progress,
            {
              toValue: 0,
              duration: 250
            }
        ).start();
        this.animating = true;
        setTimeout(() => {
            if (this.animating) {
                onClose();
                this.animating = false;
            }
        }, 250);
    }

    async openURL(url) {
        const allowed = await Linking.canOpenURL(url);
        if (allowed) {
            Linking.openURL(url);
        } else {
            this.toast('Could not open URL');
        }
        this.dismiss();
    }

    pad(n) {
        return ('0' + n).slice(-2);
    }

    getTime(ts) {
        const date = new Date(ts);
        return `[${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}]`
    }

    copy(message) {
        if (message.inline) {
            Clipboard.setString(this.getText(message));
        } else {
            Clipboard.setString(`${this.getTime(message.time)} ${message.name}: ${message.text}`);
        }
        this.toast('Copied to clipboard');
        this.dismiss();
    }

    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    msg(code, ...vars) {
        const { chat } = this.props,
        messages = chat.mwmessages;

        return messages['chat-' + code].replace(/\$(\d)/g, (s, index) => vars[index - 1] || '');
    }

    getText(model) {
        const { chat, config } = this.props,
        name = chat.username,
        uselocal = config.localalerts;

        switch (model.type) {
            case 'join':
                return model.name == name ? 
                    (
                        uselocal ? this.msg('welcome-message', chat.name) : 'You have entered the chat'
                    ) : (
                        uselocal ? this.msg('user-joined', model.name) : `${model.name} has entered the chat`
                    );
            case 'part':
                return model.name == name ? (
                    'You have left the chat'
                ) : (
                    uselocal ? this.msg('user-parted', model.name) : `${model.name} has left the chat`
                );
            case 'kick':
                return model.name == name ? (
                    uselocal ? this.msg('you-were-kicked', model.mod) : `You have been kicked by ${model.mod}`
                ) : (
                    uselocal ? this.msg('user-was-kicked', model.name, model.mod) : `${model.name} has been kicked by ${model.mod}`
                );
            case 'ban':
                return model.name == name ? (
                    uselocal ? this.msg('you-were-banned', model.mod) : `You have been banned by ${model.mod}: ${model.reason.trim() || 'No reason specified.'}`
                ) : (
                    uselocal ? this.msg('user-was-banned', model.name, model.mod, '') : `${model.name} has been banned by ${model.mod}: ${model.reason.trim() || 'No reason specified.'}`
                );
            case 'unban':
                return uselocal ? this.msg('user-was-unbanned', model.name, model.mod) : `${model.name} has been unbanned by ${model.mod}: ${model.reason.trim() || 'No reason specified.'}`;
            case 'chat-err-connected-from-another-browser':
                return 'You have connected from another device. This connection will be closed.';

            default:
                return `We received an unknown inline alert type ¯\_(ツ)_/¯ (type was ${model.type}, please contact Dorumin#0969 on discord to report this issue)`;
        }
    }

    kick(name) {
        const { chat, kick } = this.props;

        kick(name, chat.private ? chat.parent.key : chat.key);
        this.dismiss();
    }

    ban() {
        const { chat, user, ban } = this.props,
        { time, reason } = this.state;

        ban(user.name, time, reason || 'Misbehaving in chat', chat.private ? chat.parent.key : chat.key);
        this.dismiss();
    }

    unban() {
        const { chat, user, ban } = this.props,
        { reason } = this.state;

        ban(user.name, '', reason || 'Undoing ban', chat.private ? chat.parent.key : chat.key);
        this.dismiss();
    }

    onChange(dimensions, event) {
        if (!this.mounted) return;
        let height = dimensions.window.height;
        if (event) {
            height -= event.endCoordinates.height;
        }
        this.setState({ height });
    }

    private(names, wiki) {
        const { session, navigation } = this.props;
        if (names.length == 1 && session.blockedBy.includes(names[0])) {
            this.toast('This user has blocked your direct messages.');
        } else {
            this.props.private(names, wiki).then(chat => this.props.switch(chat.key) && navigation.navigate('Messages'));
            this.dismiss();
        }
    }

    block(name, wiki) {
        this.props.block(name).then(() => this.props.switch(wiki));
        this.toast(`${name} has been blocked.`);
        this.dismiss();
    }

    unblock(name) {
        this.props.unblock(name);
        this.toast(`${name} has been unblocked.`);
        this.dismiss();
    }

    render() {
        const { user, message, session, chat, onClose } = this.props,
        { progress, height } = this.state,
        groups = user ? user.groups[chat.code] || {} : {};
        return (
            <Modal
                visible={!!user || !!message}
                onRequestClose={onClose}
                transparent={true}
            >
                {Boolean(user || message) &&
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,.7)']
                            })
                        }}
                    >
                        <StatusBar
                            backgroundColor="#4c4c4c"
                            barStyle="light-content"
                        />
                        <View
                            style={{
                                paddingTop: 30
                            }}
                        >
                            <TouchableWithoutFeedback
                                onPress={this.dismiss.bind(this)}
                            >
                                <Animated.View
                                    style={{
                                        width: '100%',
                                        height: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [height, height - 210]
                                        })
                                    }}
                                />
                            </TouchableWithoutFeedback>
                            <View
                                style={{
                                    width: '100%',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <View
                                    style={{
                                        height: 80,
                                        paddingRight: 10,
                                        width: '100%',
                                        backgroundColor: '#f5f5f5',
                                        flexDirection: 'row',
                                    }}
                                >
                                    {Boolean(user && (!message || !message.inline)) &&
                                        <View
                                            style={{
                                                height: 50,
                                                width: 50,
                                                margin: 15,
                                                borderRadius: 25,
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
                                    }
                                    <View
                                        style={{
                                            flex: 1
                                        }}
                                    >
                                        {Boolean(user && (!message || !message.inline)) &&
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    width: '100%'
                                                }}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={{
                                                        flexShrink: 1,
                                                        fontSize: 20,
                                                        marginVertical: 10
                                                    }}
                                                >
                                                    {user.name}
                                                </Text>
                                                <Tag
                                                    tag='Mod'
                                                    message='Chat moderator'
                                                    condition={!groups.staff && !groups.admin && groups.mod}
                                                />
                                                <Tag
                                                    tag='Admin'
                                                    message='Wiki administrator'
                                                    condition={!groups.staff && groups.admin}
                                                />
                                                <Tag
                                                    tag='S'
                                                    message='Wikia staff'
                                                    condition={groups.staff}
                                                />
                                            </View>
                                        }
                                        {!!message &&
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    margin: message.inline ? 20 : 0
                                                }}
                                                numberOfLines={message.inline ? 2 : 1}
                                            >
                                                {(message.inline ? this.getText(message) : message.text).replace(/\[\[(?:[^\]]+\|)?([^\]]+)\]\]/g, '$1')}
                                            </Text>
                                        }
                                    </View>
                                </View>
                                {this.state.banning || this.state.unbanning ? (
                                    this.state.reasoning ? (
                                        <View
                                            style={{
                                                height: 80,
                                                width: '100%',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#ccc',
                                                alignItems: 'center',
                                                justifyContent: 'space-around',
                                                flexDirection: 'row'
                                            }}
                                        >
                                            <TextInput
                                                style={{
                                                    flex: 1,
                                                    height: 80,
                                                    fontSize: 20,
                                                    paddingHorizontal: 10
                                                }}
                                                disableFullscreenUI={true}
                                                maxLength={255}
                                                underlineColorAndroid='transparent'
                                                placeholder={this.state.unbanning ? 'Undoing ban' : 'Misbehaving in chat'}
                                                onChangeText={text => this.setState({ reason: text })}
                                            />
                                            <Icon
                                                source={this.state.unbanning ? require('../img/unban.png') : require('../img/ban.png')}
                                                onPress={this.state.unbanning ? this.unban.bind(this) : this.ban.bind(this)}
                                                onLongPress={() => this.toast(this.state.unbanning ? 'Unban this user' : 'Ban this user')}
                                            />
                                        </View>
                                    ) : (
                                        <View
                                            style={{
                                                height: 80,
                                                width: '100%',
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#ccc',
                                                alignItems: 'center',
                                                justifyContent: 'space-around',
                                                flexDirection: 'row'
                                            }}
                                        >
                                            <Picker
                                                style={{
                                                    flex: 1
                                                }}
                                                selectedValue={this.state.time}
                                                onValueChange={value => this.setState({ time: value })}
                                            >
                                                <Picker.Item label="20 minutes" value="1200" />
                                                <Picker.Item label="2 hours" value="7200" />
                                                <Picker.Item label="12 hours" value="43200" />
                                                <Picker.Item label="1 day" value="86400" />
                                                <Picker.Item label="3 days" value="259200" />
                                                <Picker.Item label="1 week" value="604800" />
                                                <Picker.Item label="2 weeks" value="1209600" />
                                                <Picker.Item label="1 month" value="2628000" />
                                                <Picker.Item label="3 months" value="7884000" />
                                                <Picker.Item label="6 months" value="15768000" />
                                                <Picker.Item label="1 year" value="31536000" />
                                                <Picker.Item label="Indefinitely" value="31536000000" />
                                            </Picker>
                                            <Icon
                                                source={require('../img/next.png')}
                                                onPress={() => this.setState({ reasoning: true })}
                                                onLongPress={() => this.toast('Pick a ban reason')}
                                            />
                                        </View>
                                    )
                                ) : (
                                    <View
                                        style={{
                                            height: 80,
                                            width: '100%',
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#ccc',
                                            alignItems: 'center',
                                            justifyContent: 'space-around',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <Icon
                                            source={require('../img/profile.png')}
                                            onPress={() => this.openURL(`http://${chat.code}.wikia.com/User:${user.name || message.user.name}`)}
                                            onLongPress={() => this.toast('Open user page')}
                                            condition={user}
                                        />
                                        <Icon
                                            source={require('../img/wall.png')}
                                            onPress={() => this.openURL(`http://${chat.code}.wikia.com/User_talk:${user.name || message.user.name}`)}
                                            onLongPress={() => this.toast('Open message wall')}
                                            condition={user}
                                        />
                                        <Icon
                                            source={require('../img/copy.png')}
                                            onPress={() => this.copy(message)}
                                            onLongPress={() => this.toast('Copy to clipboard')}
                                            condition={message}
                                        />
                                        <Icon
                                            source={require('../img/private.png')}
                                            onPress={() => this.private([user.name], chat.code)}
                                            onLongPress={() => this.toast('Direct message')}
                                            condition={chat.connected && user && chat.users.includes(user.name) && user.name != session.name && !session.blocked.includes(user.name) && !chat.privates.some(arr => arr.length == 1 && arr[0] == user.name)}
                                        />
                                        <Icon
                                            source={require('../img/block.png')}
                                            onPress={() => this.block(user.name, chat.code)}
                                            onLongPress={() => this.toast('Block direct messages')}
                                            condition={chat.connected && user && chat.users.includes(user.name) && user.name != session.name && !session.blocked.includes(user.name) && chat.privates.some(arr => arr.length == 1 && arr[0] == user.name)}
                                        />
                                        <Icon
                                            source={require('../img/unblock.png')}
                                            onPress={() => this.unblock(user.name)}
                                            onLongPress={() => this.toast('Unblock direct messages')}
                                            condition={chat.connected && user && chat.users.includes(user.name) && user.name != session.name && session.blocked.includes(user.name)}
                                        />
                                        <Icon
                                            source={require('../img/kick.png')}
                                            onPress={() => this.kick(user.name)}
                                            onLongPress={() => this.toast('Kick this user')}
                                            condition={chat.connected && user && chat.users.includes(user.name) && user.name != session.name && (chat.admin && !groups.admin || chat.mod && !groups.mod)}
                                        />
                                        <Icon
                                            source={require('../img/ban.png')}
                                            onPress={() => this.setState({ banning: true })}
                                            onLongPress={() => this.toast('Ban this user')}
                                            condition={chat.connected && user && (message && (message.type == 'kick' || message.type == 'part') || chat.users.includes(user.name)) && user.name != session.name && (chat.admin && !groups.admin || chat.mod && !groups.mod)}
                                        />
                                        <Icon
                                            source={require('../img/unban.png')}
                                            onPress={() => this.setState({ unbanning: true, reasoning: true })}
                                            onLongPress={() => this.toast('Unban this user')}
                                            condition={chat.connected && user && message && message.type == 'ban' && user.name != session.name && (chat.admin && !groups.admin || chat.mod && !groups.mod)}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                }
            </Modal>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            kick: (name, wiki) => dispatch(kickUser(name, wiki)),
            ban: (name, time, reason, wiki) => dispatch(banUser(name, time, reason, wiki)),
            private: (names, wiki) => dispatch(joinPrivate(names, wiki)),
            block: name => dispatch(blockPrivate(name, false)),
            unblock: name => dispatch(blockPrivate(name, true)),
            switch: key => dispatch(switchChat(key)),
        }
    }
)(Popout);