import React from 'react';
import {
    Text,
    Linking,
    Platform,
    ToastAndroid
} from 'react-native';
import { connect } from 'react-redux';
import { fetchChat, switchChat } from '../actions';

class Anchor extends React.Component {
    async openURL(url) {
        const { fetchChat, switchChat } = this.props,
        match = url.match(/c:(.+):Special:Chat|\/\/(.+)\.wikia\.com\/(?:wiki\/)?Special:chat/i);
        if (match) {
            fetchChat(match[1]).then(() => switchChat(match[1]));
        } else {
            const allowed = await Linking.canOpenURL(url);
            if (allowed) {
                Linking.openURL(url);
            } else {
                this.toast('Could not open URL');
            }
        }
    }

    toast(text) {
        if (Platform.OS == 'android') {
            const match = text.match(/c:(.+):Special:Chat|\/\/(.+)\.wikia\.com\/(?:wiki\/)?Special:chat/i);
            if (match) {
                ToastAndroid.show(`Enter chat: ${match[1]}`, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show(text, ToastAndroid.SHORT);
            }
        }
    }

    render() {
        const { url, children } = this.props;
        return (
            <Text
                onPress={this.openURL.bind(this, url)}
                onLongPress={this.toast.bind(this, url)}
            >
                {children}
            </Text>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            fetchChat: wiki => dispatch(fetchChat(wiki)),
            switchChat: wiki => dispatch(switchChat(wiki))
        }
    }
)(Anchor);