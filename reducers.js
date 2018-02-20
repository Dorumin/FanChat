import { combineReducers } from 'redux';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
    SWITCH_CHAT,
    RECEIVE_USER,
    REMOVE_USER,
    RECEIVE_MESSAGE,
    REQUEST_CHAT,
    RECEIVE_CHAT,
    FAILED_CHAT,
    REMOVE_CHAT,
    HIDE_CHAT,
    LOGIN_REQUEST,
    LOGIN_ERROR,
    LOGIN_SUCCESS,
    LOGOUT,
    CACHE_DIMENSIONS,
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    SET_AVATAR,
    SET_CONFIG,
    UNBLOCKED_USER,
    BLOCKED_USER,
    ACKNOWLEDGE_CHAT
} from './actions';

function currentChat(state = '', action) {
    switch (action.type) {
        case SWITCH_CHAT:
            return action.id;
        
        default:
            return state
    }
}

function dimensions(state = {}, action) {
    switch (action.type) {
        case CACHE_DIMENSIONS:
            return Object.assign({}, state, {
                [action.uri]: action.dimensions
            });
        
        default:
            return state;
    }
}

function users(state = {}, action) {
    switch (action.type) {
        case RECEIVE_USER:
            const copy = state[action.user.name] || {};
            return Object.assign({}, state, {
                [action.user.name]: Object.assign({}, action.user, {
                    groups: Object.assign({}, copy.groups || {}, {
                        [action.wiki]: action.groups
                    })
                })
            });
            // Note: We do not delete user models. Those are kept for backlog display.
        
        default:
            return state;
    }
}

function messages(state = {}, action) {
    switch (action.type) {
        case RECEIVE_MESSAGE:
            return Object.assign({}, state, {
                [action.id]: action.body
            });
        
        default:
            return state;
    }
}

function chats(state = {}, action) {
    let copy = Object.assign({}, state);
    switch (action.type) {
        case REQUEST_CHAT:
            return Object.assign({}, state, {
                [action.wiki]: Object.assign({}, state[action.wiki], {
                    processing: true,
                    code: action.wiki
                })
            });
        case FAILED_CHAT:
            return Object.assign({}, state, {
                [action.wiki]: {
                    failed: true,
                    error: action.error,
                    code: action.wiki
                }
            })
        case RECEIVE_CHAT:
            return Object.assign({}, state, {
                [action.wiki]: action.chat
            });
        case REMOVE_CHAT:
            if (!copy[action.wiki]) return state;
            delete copy[action.wiki];
            return copy
        case HIDE_CHAT:
            if (!copy[action.wiki]) return state;
            copy[action.wiki].hidden = true;
            return copy;
        case CONNECTING:
            copy[action.wiki].connecting = true;
            return copy;
        case CONNECTED:
            const wiki = copy[action.wiki];
            if (action.mod === undefined) {
                wiki.connecting = false;
                wiki.connected = true;
            } else {
                wiki.mod = action.mod;
                wiki.admin = action.admin;
            }
            return copy;
        case DISCONNECTED:
            copy[action.wiki].connected = false;
            copy[action.wiki].socket.disconnect();
            delete copy[action.wiki].socket;
            return copy;
        case RECEIVE_USER:
            if (!copy[action.key] || copy[action.key].users.includes(action.user.name)) return copy;
            copy[action.key].users.push(action.user.name);
            return copy;
        case REMOVE_USER:
            if (!copy[action.wiki].users.includes(action.name)) return copy;
            const users = copy[action.wiki].users;
            users.splice(users.indexOf(action.name), 1);
            return copy;
        case RECEIVE_MESSAGE:
            const messages = copy[action.wiki].messages;
            if (messages.includes(action.id)) return copy;
            copy[action.wiki].lastMessageTime = action.body.time;
            messages.push(action.id);
            return copy;
        case ACKNOWLEDGE_CHAT:
            const chat = copy[action.wiki];
            if (!chat) return state;
            const msgs = chat.messages.filter(n => !isNaN(n)),
            lastId = msgs[msgs.length - 1];
            if (chat.acknowledged == lastId) return state;
            chat.acknowledged = lastId;
            return copy;

        default:
            return state;
    }
}

function session(state = {}, action) {
    switch (action.type) {
        case SET_AVATAR:
            return Object.assign({}, state, {
                avatar: action.url
            });
        case LOGIN_REQUEST:
            return Object.assign({}, state, {
                processing: true
            });
        case LOGIN_SUCCESS:
            return {
                name: action.name,
                id: action.id,
                avatar: action.avatar,
                token: action.token,
                encodedtoken: encodeURIComponent(action.token),
                props: action.props,
                blocked: action.blocks.blockedChatUsers,
                blockedBy: action.blocks.blockedByChatUsers,
                loggedIn: true
            };
        case LOGIN_ERROR:
            return {
                failed: true,
                error: action.error
            };
        case LOGOUT:
            return {};
        case BLOCKED_USER:
            return Object.assign({}, state, {
                blocked: state.blocked.concat([action.name])
            });
        case UNBLOCKED_USER:
            return Object.assign({}, state, {
                blocked: state.blocked.filter(name => name != action.name)
            });

        default:
            return state;
    }
}

function config(state = {}, action) {
    switch (action.type) {
        case SET_CONFIG:
            return Object.assign({}, state, {
                [action.id]: Object.assign({}, state[action.id] || {}, {
                    [action.key]: action.value
                })
            });
        case LOGIN_SUCCESS:
            return Object.assign({}, state, {
                [action.id]: state[action.id] || {}
            });

        default:
            return state;
    }
}

const models = persistReducer(
    {
        key: 'models',
        storage: storage,
        transforms: [
            createTransform(
                (inboundState, key) => {
                    const state = Object.assign({}, inboundState);
                    for (const key in state) {
                        state[key] = Object.assign({}, state[key]);
                        delete state[key].socket;
                        delete state[key].parent;
                    }
                    return state;
                },
                (outboundState, key) => {
                    if (key != 'chats') return outboundState;
                    const state = Object.assign({}, outboundState);
                    for (const key in state) {
                        state[key] = Object.assign({}, state[key], {
                            refetch: true,
                            connected: false,
                            connecting: false
                        });
                    }
                    return state;
                },
                {
                    whitelist: [ 'chats' ]
                }
            )
        ]
    },
    combineReducers({
        users,
        messages,
        chats
    })
),

rootReducer = combineReducers({
    models,
    currentChat,
    dimensions,
    session,
    config
});

export default rootReducer;