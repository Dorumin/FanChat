import React from 'react';
import {
    View,
    Text,
    Switch
} from 'react-native';
import { connect } from 'react-redux';
import { setConfig } from '../actions';
import Touchable from 'react-native-platform-touchable';

class ConfigSwitch extends React.Component {
    onChange(value) {
        const { type, set, onChange } = this.props;
        set(type, value);
        if (onChange) {
            onChange(value);
        }
    }

    render() {
        const { title, message, type, config } = this.props;
        return (
            <View>
                <Touchable
                    background={Touchable.Ripple('#eef')}
                    activeOpacity={1}
                    onPress={() => this.onChange(!config[type])}
                >
                    <View
                        style={{
                            borderBottomColor: '#ccc',
                            borderBottomWidth: 1,
                            marginHorizontal: 10
                        }}
                    >
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingTop: 5
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 20
                                }}
                            >
                                {title}
                            </Text>
                            <Switch
                                onValueChange={this.onChange.bind(this)}
                                value={config[type]}
                            />
                        </View>
                        {!!message &&
                            <Text
                                style={{
                                    color: '#888',
                                    paddingVertical: 5
                                }}
                            >
                                {message}
                            </Text>
                        }
                    </View>
                </Touchable>
            </View>
        )
    }
}

export default connect(
    state => {
        return {
            config: state.config[state.session.id]
        }
    },
    dispatch => {
        return {
            set: (type, value) => dispatch(setConfig(type, value))
        }
    }
)(ConfigSwitch);