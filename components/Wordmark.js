import React from 'react';
import {
    TouchableOpacity,
    Image,
    View,
    Text
} from 'react-native';
import { connect } from 'react-redux';
import FullHeightImage from './FullHeightImage';

class Wordmark extends React.Component {
    render() {
        const { chats, wiki, session } = this.props,
        model = chats[wiki];
        let wordmark,
        logo;
        if (!wiki || !model) {
            wordmark = require('../img/logo.png');
            logo = true;
        } else if (!model.wordmark) {
            wordmark = null;
        } else {
            wordmark = {
                uri: model.wordmark
            };
        }
        return (
            <TouchableOpacity
                onPress={this.props.onPress}
                onLongPress={this.props.onLongPress}
                style={{
                    flex: 1,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {
                wordmark ?
                    (
                    logo ?
                        <Image
                            source={wordmark}
                            style={{
                                height: 60,
                                width: 60
                            }}
                        /> :
                        <FullHeightImage
                            source={wordmark}
                            style={{
                                ...this.props.style
                            }}
                            height={40}
                        />
                    )
                :
                    model.private ? (
                        <View
                            style={{
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18
                                }}
                                numberOfLines={1}
                            >
                                {
                                    model.users.filter(n => n != session.name).join(', ')
                                }
                            </Text>
                            {!!(model.parent && model.parent.wordmark) &&
                                <View
                                    style={{
                                        position: 'absolute',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        opacity: .1
                                    }}
                                >
                                    <FullHeightImage
                                        source={{
                                            uri: model.parent.wordmark
                                        }}
                                        height={40}
                                    />
                                </View>
                            }
                        </View>
                    ) : (
                        <Text
                            style={{
                                fontSize: 20
                            }}
                            numberOfLines={1}
                        >
                            {model.name}
                        </Text>
                    )
                }
            </TouchableOpacity>
        )
    }
}

export default connect(
    state => {
        return {
            chats: state.models.chats,
            currentChat: state.currentChat,
            session: state.session
        }
    }
)(Wordmark);