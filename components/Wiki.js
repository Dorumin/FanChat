import React from 'react';
import {
    View,
    Text
} from 'react-native';
import { connect } from 'react-redux';
import { fetchChat, switchChat } from '../actions';
import Touchable from 'react-native-platform-touchable';
import FullHeightImage from './FullHeightImage';

class Wiki extends React.Component {
    openChat(wiki) {
        const { fetchChat, switchChat, navigation } = this.props;
        if (wiki.exists && !wiki.exists.hidden) {
            switchChat(wiki.code);
            navigation.goBack();
            navigation.navigate('Messages');
            return;
        }
        fetchChat(wiki.code).then(r => {
            if (!r) return;
            switchChat(wiki.code);
            navigation.goBack();
            navigation.navigate('Messages');
        });
    }

    render() {
        const { wiki, disabled } = this.props;
        return (
            <Touchable
                onPress={() => disabled || this.openChat(wiki)}
                background={Touchable.Ripple('#eef')}
                delayPressIn={0}
            >
                <View
                    style={{
                        height: 80,
                        width: '100%',
                        flexDirection: 'row'
                    }}
                >
                    <View
                        style={{
                            marginLeft: 10,
                            marginRight: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                            flexGrow: 1,
                            flexDirection: 'row'
                        }}
                    >
                        <View>
                            <Text
                                style={{
                                    fontSize: 16,
                                    marginTop: 10,
                                    marginRight: wiki.wordmark ? 160 : 0
                                }}
                                numberOfLines={2}
                            >
                                {wiki.name}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: '#666'
                                }}
                            >
                                {wiki.domain}
                            </Text>
                        </View>
                        {!!wiki.wordmark &&
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    minWidth: 160,
                                    height: 80,
                                    top: 0,
                                    right: 0,
                                    opacity: .5
                                }}
                            >
                                <FullHeightImage
                                    source={{
                                        uri: wiki.wordmark
                                    }}
                                    height={40}
                                />
                            </View>
                        }
                    </View>
                </View>
            </Touchable>
        )
    }
}

export default connect(
    null,
    dispatch => {
        return {
            fetchChat: wiki => dispatch(fetchChat(wiki, true)),
            switchChat: wiki => dispatch(switchChat(wiki))
        }
    }
)(Wiki);