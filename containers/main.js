import React from 'react';
import { Text } from 'react-native';
import { TabNavigator, StackNavigator } from 'react-navigation';
import slideFromRight from 'react-navigation-slide-from-right-transition';
import Navigation from '../components/Navigation';
import Chats from '../screens/Chats';
import Messages from '../screens/Messages';
import Users from '../screens/Users';
import NewChatModal from '../screens/NewChatModal';
import Configuration from '../screens/config/Main';
import Configuration_Profile from '../screens/config/Profile';
import Configuration_Pings from '../screens/config/Pings';
import Configuration_Settings from '../screens/config/Settings';

const Main = TabNavigator(
    {
        Chats: {
            screen: Chats
        },
        Messages: {
            screen: Messages
        },
        Users: {
            screen: Users
        }
    },
    {
        tabBarComponent: Navigation,
        tabBarPosition: 'top',
        animationEnabled: true,
        swipeEnabled: true
    }
);

Main.navigationOptions = {
    header: null
};

export default StackNavigator(
    {
        Main: {
            screen: Main
        },
        NewChatModal: {
            screen: NewChatModal
        },
        Configuration: {
            screen: Configuration
        },
        Configuration_Profile: {
            screen: Configuration_Profile
        },
        Configuration_Pings: {
            screen: Configuration_Pings
        },
        Configuration_Settings: {
            screen: Configuration_Settings
        }
    },
    {
        initialRouteName: 'Main',
        mode: 'modal',
        transitionConfig: slideFromRight
    }
);