import React from 'react';
import {
    View,
    Image,
    Keyboard,
    Platform,
    TextInput,
    BackHandler,
    ToastAndroid,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import { sendMessage } from '../actions';
import EmotePicker from './EmotePicker';

class MessageInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            height: 0,
            pickerOpen: false
        };

        this.lastChat = '';

        this.onBack = () => {
            if (this.state.pickerOpen) {
                this.setState({
                    pickerOpen: false
                });
                return true;
            }

            return false;
        };
    }

    componentDidMount() {
        this.lastChat = this.props.chat.key;
        BackHandler.addEventListener('hardwareBackPress', this.onBack);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    }

    componentDidUpdate() {
        if (this.props.chat.key != this.lastChat) {
            this.lastChat = this.props.chat.key;
            this.setState({
                pickerOpen: false
            });
        }
    }

    sendMessage() {
        const { chat, send } = this.props,
        { text } = this.state,
        input = this.input;
        if (!text.trim()) return;
        if (input) {
            input.clear();
        }
        send(text, chat.key);
        this.setState({ text: '' });
    }

    toast(text) {
        if (Platform.OS == 'android') {
            ToastAndroid.show(text, ToastAndroid.SHORT);
        }
    }

    togglePicker() {
        Keyboard.dismiss();
        this.setState({
            pickerOpen: !this.state.pickerOpen
        });
    }

    render() {
        const { chat, disabled, notconnected } = this.props;
        return (
            <View
                style={{
                    borderTopColor: '#ccc',
                    borderTopWidth: 1
                }}
            >
                <View
                    style={{
                        minHeight: 60
                    }}
                >
                    <View
                        style={{
                            borderRightColor: '#ccc',
                            borderRightWidth: 1,
                            marginRight: 80
                        }}
                    >
                        <TextInput
                            style={{
                                width: '100%',
                                height: Math.max(60, Math.min(this.state.height, 100)),
                                fontSize: 20,
                                paddingHorizontal: 10
                            }}
                            ref={input => this.input = input}
                            editable={!disabled || !notconnected}
                            multiline={true}
                            disableFullscreenUI={true}
                            maxLength={1000}
                            underlineColorAndroid='transparent'
                            placeholder={!disabled && !notconnected ? `Message ${chat.name}` : notconnected ? 'This user is no longer online' : 'Join chat to send messages'}
                            onFocus={() => this.setState({ pickerOpen: false })}
                            onChangeText={text => this.setState({ text: text })}
                            onContentSizeChange={e => this.setState({ height: e.nativeEvent.contentSize.height })}
                            value={disabled || notconnected ? '' : this.state.text}
                        />
                    </View>
                    {!!Object.keys(chat.emoticons.table).length &&
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                right: 40,
                                top: 0,
                                bottom: 0
                            }}
                            onPress={this.togglePicker.bind(this)}
                            onLongPress={this.toast.bind(this, 'Open emote picker')}
                            disabled={disabled || notconnected}
                        >
                            <Image
                                source={require('../img/smiley.png')}
                                style={{
                                    height: 20,
                                    width: 20,
                                    marginLeft: 5,
                                    opacity: !disabled && !notconnected ? 1 : .2
                                }}
                            />
                        </TouchableOpacity>
                    }
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            right: 0,
                            top: 0,
                            bottom: 0
                        }}
                        onPress={this.sendMessage.bind(this)}
                        onLongPress={this.toast.bind(this, 'Send')}
                        disabled={disabled || notconnected}
                    >
                        <Image
                            source={require('../img/send.png')}
                            style={{
                                height: 20,
                                width: 20,
                                opacity: !disabled && !notconnected ? 1 : .2
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <EmotePicker
                    onPress={emote => this.setState({ text: this.state.text + ' ' + emote })}
                    visible={this.state.pickerOpen}
                    chat={chat}
                />
            </View>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            send: (wiki, text) => dispatch(sendMessage(wiki, text))
        }
    }
)(MessageInput);