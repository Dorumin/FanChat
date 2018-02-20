import React from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    Button,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import { ScreenOrientation } from 'expo';
import { connect } from 'react-redux';
import { logout } from '../../actions';
import Switch from '../../components/ConfigSwitch';

export default class Settings extends React.Component {
    static navigationOptions = {
        title: 'App Settings'
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#fff'
                }}
            >
                <ScrollView>
                    <Switch
                        title='Landscape mode'
                        type='landscape'
                        message='Enable device rotation'
                        onChange={value => ScreenOrientation.allow(value ? ScreenOrientation.Orientation.ALL_BUT_UPSIDE_DOWN : ScreenOrientation.Orientation.PORTRAIT_UP)}
                    />
                    <Switch
                        title='Hide navigation'
                        type='slidenav'
                        message='Slide navigation off screen when the keyboard is open'
                    />
                    <Switch
                        title='Use local inline alerts'
                        type='localalerts'
                        message='Use the inline messages that each wiki set up for itself. Note that these may lack information that the system messages provide, such as ban and unban reasons, and include unnecessary links.'
                    />
                    <Switch
                        title='Hide back to bottom button'
                        type='hidebacktobottom'
                        message='If you find the scroll to bottom button in the chat intrusive, turn it off.'
                    />
                </ScrollView>
            </View>
        )
    }
}