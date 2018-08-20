import io from 'socket.io-client';

export const SWITCH_CHAT = 'SWITCH_CHAT';
export const CACHE_DIMENSIONS = 'CACHE_DIMENSIONS';
export const RECEIVE_USER = 'RECEIVE_USER';
export const REMOVE_USER = 'REMOVE_USER';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export const REQUEST_CHAT = 'REQUEST_CHAT';
export const RECEIVE_CHAT = 'RECEIVE_CHAT';
export const FAILED_CHAT = 'FAILED_CHAT';
export const REMOVE_CHAT = 'REMOVE_CHAT';
export const HIDE_CHAT = 'HIDE_CHAT';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const CONNECTING = 'CONNECTING';
export const CONNECTED = 'CONNECTED';
export const DISCONNECTED = 'DISCONNECTED';
export const SET_AVATAR = 'SET_AVATAR';
export const SET_CONFIG = 'SET_CONFIG';
export const BLOCKED_USER = 'BLOCKED_USER';
export const UNBLOCKED_USER = 'UNBLOCKED_USER';
export const ACKNOWLEDGE_CHAT = 'ACKNOWLEDGE_CHAT';

const partTimeouts = {};

export function switchChat(id) {
    return {
        type: SWITCH_CHAT,
        id: id.split('/').slice(1).join('/') || id
    }
}

export function cacheDimensions(uri, dimensions) {
    return {
        type: CACHE_DIMENSIONS,
        uri,
        dimensions
    }
}

function requestChat(wiki) {
    return {
        type: REQUEST_CHAT,
        wiki
    }
}

function receiveChat(chat) {
    return {
        type: RECEIVE_CHAT,
        wiki: chat.key,
        chat
    }
}

function failedChat(wiki, error) {
    return {
        type: FAILED_CHAT,
        wiki,
        error
    }
}

export function leaveChat(wiki) {
    wiki = wiki.split('/').pop();
    return (dispatch, getState) => {
        return new Promise(res => {
            const state = getState(),
            chat = state.models.chats[state.session.id + '/' + wiki];
            if (chat && chat.socket) {
                chat.socket.on('disconnect', () => {
                    delete chat.socket;
                    res();
                });
                chat.socket.send(JSON.stringify({
                    attrs: {
                        msgType: 'command',
                        command: 'logout'
                    }
                }));
            } else {
                res();
            }
        });
    }
}

export function removeChat(wiki) {
    return (dispatch, getState) => {
        const state = getState();
        leaveChat(wiki)(dispatch, getState).then(() => {
            if (state.currentChat == wiki) {
                dispatch(switchChat(''));
            }
            dispatch({
                type: REMOVE_CHAT,
                wiki
            });
        })
    }
}

export function hideChat(wiki) {
    return (dispatch, getState) => {
        leaveChat(wiki)(dispatch, getState).then(() => {
            if (getState().currentChat == wiki) {
                dispatch(switchChat(''));
            }
            dispatch({
                type: HIDE_CHAT,
                wiki
            });
        })
    }
}

function receiveMessage(message, wiki) {
    const body = {},
    id = message.id || `inline-${Date.now()}-${Math.random().toString().slice(2)}`;
    body.inline = message.isInlineAlert;
    body.name = message.name;
    body.text = message.text;
    body.time = message.timeStamp || Date.now();
    if (message.mod) {
        body.mod = message.mod;
    }
    if (message.wfMsg) {
        body.type = message.wfMsg;
    }
    if (message.reason) {
        body.reason = message.reason;
    }
    return {
        type: RECEIVE_MESSAGE,
        body,
        wiki,
        id
    };
}

function receiveUser(user, wiki, key) {
    return {
        type: RECEIVE_USER,
        wiki,
        key,
        user: {
            name: user.name,
            avatar: user.avatarSrc.replace(/28(?!.*28)/, '150')
        },
        groups: {
            mod: user.isModerator,
            admin: user.groups.includes('sysop'),
            staff: user.groups.includes('staff')
        }
    }
}

function removeUser(name, wiki) {
    return {
        type: REMOVE_USER,
        wiki,
        name
    }
}

function shouldFetchChat(state, chat) {
    if (!state.session.name || chat && chat.connected) {
        return false;
    } else if (!chat.roomId) {
        return true;
    } else {
        return chat.refetch;
    }
}

function parseEmoticons(chat) {
    const emotes = chat.variables.wgChatEmoticons,
    lines = emotes.split('\n');
    chat.emoticons = {other: [], table: {}, images: {}};
    let emote = '';
    for (let i = 0, l = lines.length; i < l; i++) {
        const line = lines[i];
        if (line.charAt(0) == '*') {
            if (line.charAt(1) == '*') {
                if (emote) {
                    const emoticon = line.slice(2).trim();
                    if (emoticon) {
                        chat.emoticons.table[emoticon.toLowerCase()] = emote;
                        chat.emoticons.images[emote] = chat.emoticons.images[emote] || emoticon;
                        const first = emoticon.charAt(0),
                        last = emoticon.charAt(emoticon.length - 1);
                        if (!(first == '(' && last == ')' || first == ':' && last == ':')) {
                            chat.emoticons.other.push(emoticon);
                        }
                    }
                }
            } else {
                emote = line.slice(1).trim();
            }
        }
    }
}

export function fetchChat(wiki, unhide) {
    wiki = wiki.split('/').pop();
    return async (dispatch, getState) => {
        wiki = (await fetch(`http://${wiki.split('/').pop()}.wikia.com/wikia.php`)).url.match(/\/\/(.+)\.wikia.com/)[1]; // Redirects
        const state = getState(),
        key = state.session.id + '/' + wiki,
        oldChat = state.models.chats[key] || {},
        encodedName = encodeURIComponent(state.session.name);
        if (!shouldFetchChat(state, oldChat) && !unhide) return;
        dispatch(requestChat(key));
        const results = await Promise.all([
            fetch(`http://${wiki}.wikia.com/api.php?action=query&meta=siteinfo&siprop=wikidesc&format=json`),
            fetch(`http://${wiki}.wikia.com/wikia.php?controller=Chat&format=json`),
            fetch(`http://${wiki}.wikia.com/wikia.php?controller=UserProfilePage&method=renderUserIdentityBox&title=User:${encodedName}&format=json&uselang=en`),
            fetch(`http://${wiki}.wikia.com/wikia.php?controller=ChatBanListSpecial&method=axShowUsers&username=${encodedName}&format=json`),
            fetch(`http://${wiki}.wikia.com/api.php?action=query&meta=allmessages&ammessages=chat-user-joined|chat-user-parted|chat-user-was-kicked|chat-you-were-kicked|chat-user-was-banned|chat-you-were-banned|chat-user-was-unbanned|chat-welcome-message&format=json`),
            fetch(`http://${wiki}.wikia.com/api.php?action=query&titles=KockaIsAGod|ISwearToKockaIfThisPageExists&prop=info&intoken=edit&format=json`)
        ]);
        const [
            site,
            chat,
            profile,
            bans,
            mwmessages,
            tokenresult
        ] = await Promise.all(results.map(result => result.json()));
        if (chat.exception) {
            dispatch(failedChat(key, chat.exception.type));
            return;
        }
        chat.token = tokenresult.query.pages['-1'].edittoken;
        chat.encodedtoken = encodeURIComponent(chat.token);
        chat.blocked = profile.isBlocked;
        chat.banned = chat.blocked || !!bans.aaData;
        chat.wordmark = chat.themeSettings['wordmark-image-url'];
        chat.code = wiki;
        chat.key = key;
        chat.userid = state.session.id;
        chat.lastMessageTime = (unhide || !oldChat.lastMessageTime) ? Date.now() : oldChat.lastMessageTime;
        chat.mwmessages = {};
        chat.messages = oldChat.messages || [];
        chat.users = [];
        chat.privates = [];
        chat.acknowledged = null;
        chat.hidden = unhide ? false : oldChat.hidden || false;
        chat.connecting = false;
        chat.connected = false;
        chat.refetch = false;
        chat.admin = false;
        chat.mod = false;
        Object.assign(chat, site.query.wikidesc, {
            variables: JSON.parse(
                chat.globalVariablesScript
                    .match(/mw\.config\.set\(({[\s\S]+?})\)/)[1]
                    .replace(/\\x([0-9a-f]{2})/g, '\\u00$1')                // http://stackoverflow.com/questions/21085673
                    .replace(/\\'/g, "'")                                   // http://stackoverflow.com/questions/6096601 - names with ' r for tards
					.replace(/"wgSeparatorTransformTable":\[.+?\],/, '')    // don't ask...
            )
        });
        chat.name = chat.variables.wgSitename;
        if (chat.wordmark.startsWith('data:image/gif;')) {
            chat.wordmark = '';
        }
        mwmessages.query.allmessages.forEach(message => {
            chat.mwmessages[message.name] = message['*']
        });
        parseEmoticons(chat);
        delete chat.variables.wgChatEmoticons;
        delete chat.globalVariablesScript;
        dispatch(receiveChat(chat));
        return chat;
    }
}

function dispatchSocketEvent(event, dispatch, socket, getState) {
    let body;
    try {
        body = typeof event.data == 'object' ? event.data : JSON.parse(event.data);
    } catch(e) {
        console.log('json parse error', event.event, event.data);
        return;
    }
    const type = event.event,
    attrs = body.attrs,
    chat = socket.chat,
    wiki = chat.key,
    name = chat.code,
    state = getState();
    console.log(type);
    switch (type) {
        case 'chat:add':
            if (!chat.private || !state.session.blocked.includes(attrs.name)) {
                dispatch(receiveMessage(attrs, wiki));
                if (attrs.name == state.session.name) {
                    dispatch(acknowledge(wiki));
                }
            }
            if (attrs.wfMsg == 'chat-err-connected-from-another-browser' && !chat.private) {
                dispatch(disconnected(wiki));
            }
            break;
        case 'join':
            if (attrs.name == state.session.name) {
                if (!chat.connected) {
                    dispatch(connected(wiki, attrs));
                    socket.send(JSON.stringify({
                        attrs: {
                            msgType: 'command',
                            command: 'initquery'
                        }
                    }));
                }
            } else {
                if (partTimeouts[wiki + '/' + attrs.name]) {
                    clearTimeout(partTimeouts[wiki + '/' + attrs.name]);
                    delete partTimeouts[wiki + '/' + attrs.name];
                } else if (!chat.private && !chat.users.includes(attrs.name)) {
                    dispatch(
                        receiveMessage(
                            {
                                isInlineAlert: true,
                                wfMsg: 'join',
                                name: attrs.name
                            },
                            wiki
                        )
                    );
                }
                dispatch(receiveUser(attrs, name, wiki));
            }
            break;
        case 'logout':
        case 'part':
            const message = receiveMessage(
                {
                    isInlineAlert: true,
                    wfMsg: 'part',
                    name: attrs.name,
                    timeStamp: Date.now()
                },
                wiki
            );
            if (attrs.name == state.session.name) {
                dispatch(disconnected(wiki));
                if (!chat.private) {
                    dispatch(message);
                    dispatch(removeUser(attrs.name, wiki));
                }
            } else if (!partTimeouts[wiki + '/' + attrs.name] && chat.users.includes(attrs.name)) {
                partTimeouts[wiki + '/' + attrs.name] = setTimeout(() => {
                    delete partTimeouts[wiki + '/' + attrs.name];
                    if (!chat.private && chat.users.includes(attrs.name)) {
                        dispatch(message);
                        dispatch(removeUser(attrs.name, wiki));
                    }
                }, type == 'part' ? 45000 : 10000);
            }
            break;
        case 'updateUser':
            console.log(body);
            break;
        case 'initial':
            const { users, chats } = body.collections,
            oldUsers = chat.users.slice(0);
            chat.users = [];
            users.models.forEach(user => {
                chat.users.push(user.attrs.name);
                dispatch(receiveUser(user.attrs, name, wiki));
            });
            oldUsers.filter(name => !chat.users.includes(name)).forEach(name => removeUser(name, wiki));;
            chats.models.forEach(chat => {
                if (!state.models.users[chat.attrs.name]) { // Done in order to see message backlong when the user has left chat (and you don't have them cached)
                    dispatch(receiveUser(
                        {
                            avatarSrc: chat.attrs.avatarSrc,
                            name: chat.attrs.name,
                            groups: [],
                            isModerator: false
                        },
                        name,
                        wiki
                    ));
                }
                dispatch(receiveMessage(chat.attrs, wiki));
            });
            if (!chat.rehydrating) {
                dispatch(connected(wiki));
            }
            if (!chat.private && !chat.rehydrating) {
                dispatch(
                    receiveMessage(
                        {
                            isInlineAlert: true,
                            wfMsg: 'join',
                            name: state.session.name
                        },
                        wiki
                    )
                );
            }
            chat.rehydrating = false;
            break;
        case 'kick':
            dispatch(removeUser(attrs.kickedUserName, wiki));
            dispatch(receiveMessage(
                {
                    isInlineAlert: true,
                    wfMsg: 'kick',
                    name: attrs.kickedUserName,
                    mod: attrs.moderatorName
                },
                wiki
            ));
            if (attrs.kickedUserName == state.session.name) dispatch(disconnected(wiki));
            break;
        case 'ban':
            dispatch(removeUser(attrs.kickedUserName, wiki));
            dispatch(receiveMessage(
                {
                    isInlineAlert: true,
                    wfMsg: attrs.time ? 'ban' : 'unban',
                    name: attrs.kickedUserName,
                    mod: attrs.moderatorName,
                    reason: attrs.reason
                },
                wiki
            ));
            if (attrs.kickedUserName == state.session.name) dispatch(disconnected(wiki));
            break;
        case 'openPrivateRoom':
            dispatch(joinPrivate(attrs.users, name));
            break;
        case 'meta':
            console.log('wtf do you expect me to do with this');
            break;

        default:
            console.log(`Uncaught socket event ${type}`);
    }
}

function connecting(wiki) {
    return {
        type: CONNECTING,
        wiki
    }
}

function connected(wiki, attrs) {
    if (!attrs) {
        return {
            type: CONNECTED,
            wiki
        }
    }
    return {
        type: CONNECTED,
        wiki,
        mod: attrs.isModerator,
        admin: attrs.groups.includes('sysop')
    }
}

function disconnected(wiki) {
    return {
        type: DISCONNECTED,
        wiki
    }
}

export function joinPrivate(names, wiki) {
    return async (dispatch, getState) => {
        const state = getState(),
        { session } = state;

        names = names.filter(n => n != session.name).sort();
        const key = `${session.id}/${wiki}/${names.join('|')}`;
        names = names.concat([session.name]).sort(),
        already = state.models.chats[key] || {};

        if (already.connected) return already;

        const mutual = state.models.chats[session.id + '/' + wiki];
        if (!mutual) return null;

        const result = await fetch(`http://${wiki}.wikia.com/index.php?action=ajax&rs=ChatAjax&method=getPrivateRoomID`, {
            method: 'POST',
            body: `users=${JSON.stringify(names)}&token=${mutual.encodedtoken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }),
        id = (await result.json()).id;

        if (!id) return null;
        const chat = state.models.chats[key] = Object.assign({}, mutual, already, {
            users: names,
            acknowledged: already.messages && already.messages[already.messages.length - 1] || null,
            private: true,
            connected: false,
            wordmark: '',
            name: names.filter(n => n != session.name)[0],
            key: key,
            messages: already.messages || [],
            roomId: id,
            parent: mutual
        });
        const socket = chat.socket = io.connect('http://chat.wikia-services.com', {
            query: {
                name: session.name,
                key: chat.chatkey,
                serverId: chat.id,
                wikiId: chat.id,
                roomId: id
            }
        });
        socket.chat = chat;
        await new Promise(res => {
            socket.on('message', body => {
                dispatchSocketEvent(body, dispatch, socket, getState);
                if (body.event == 'initial') res();
            });
        });

        mutual.privates.push(names.filter(n => n != session.name));

        return chat;
    }
};

export function joinChat(wiki) {
    return async (dispatch, getState) => {
        const state = getState(),
        { session } = state,
        key = session.id + '/' + wiki;
        if (!state.models.chats[key]) {
            console.log("wtf this wasn't supposed to happen");
            await fetchChat(wiki);
        }
        const chat = state.models.chats[key];
        if (!chat || chat.socket) return;
        dispatch(connecting(key));
        const socket = chat.socket = io.connect('http://chat.wikia-services.com', {
            query: {
                name: session.name,
                key: chat.chatkey,
                serverId: chat.id,
                wikiId: chat.id,
                roomId: chat.roomId
            }
        });
        socket.chat = chat;
        socket.on('message', body => dispatchSocketEvent(body, dispatch, socket, getState));
    }
}

export function blockPrivate(name, unblocking) { // Note: Direct message blocks are GLOBAL.
    return async (dispatch, getState) => {
        const state = getState(),
        { session } = state;
        fetch('http://community.wikia.com/index.php?action=ajax&rs=ChatAjax&method=blockOrBanChat', {
            method: 'POST',
            body: `userToBan=${name}&dir=${unblocking ? 'remove' : 'add'}&token=${session.encodedtoken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        dispatch({
            type: unblocking ? UNBLOCKED_USER : BLOCKED_USER,
            name
        });
    }
}

function loginRequest(name) {
    return {
        type: LOGIN_REQUEST,
        name
    };
}

function loginSuccess(name, id, avatar, token, props, blocks) {
    return {
        type: LOGIN_SUCCESS,
        name,
        id,
        avatar,
        token,
        props,
        blocks
    }
}

export function loginFailure(error) {
    return {
        type: LOGIN_ERROR,
        error
    }
}

export function attemptLogin(name, pass) {
    return async dispatch => {
        dispatch(loginRequest(name));
        try {
            const result = await fetch('https://services.wikia.com/auth/token', {
                method: 'POST',
                body: `username=${name}&password=${pass}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }),
            login = await result.json();
            if (login.error) throw login;
            const results = await Promise.all([
                fetch(`http://www.wikia.com/api/v1/User/Details?ids=${name}&size=150`),
                fetch(`http://community.wikia.com/api.php?action=query&titles=DORUFORPRESIDENT&prop=info&intoken=edit&format=json`),
                fetch(`http://services.wikia.com/user-attribute/user/${login.user_id}`),
                fetch(`http://community.wikia.com/index.php?action=ajax&rs=ChatAjax&method=getPrivateBlocks&NONCE=${Math.random()}`) // This is actually POSTed on Special:Chat but it's not required apparently
            ]),
            [
                user,
                _token,
                profile,
                blocks
            ] = await Promise.all(results.map(r => r.json())),
            avatar = user.items[0].avatar,
            token = _token.query.pages['-1'].edittoken,
            props = {};
            profile._embedded.properties.forEach(item => {
                switch (item.name) {
                    case 'UserProfilePagesV3_gender':
                        item.name = 'gender';
                        break;
                }

                props[item.name] = item.value;
            });

            dispatch(loginSuccess(name, login.user_id, avatar, token, props, blocks));
        } catch(e) {
            dispatch(loginFailure(e.error));
        }
    }
}

export function refreshChats(wiki) {
    return (dispatch, getState) => {
        const { models } = getState(),
        data = JSON.stringify({
            attrs: {
                msgType: 'command',
                command: 'initquery'
            }
        });
        

        Object.values(models.chats)
            .filter(chat => chat.connected)
            .forEach(chat => {
                chat.rehydrating = true;
                chat.socket.send(data)
            });
    }
}

export function logout() {
    return async (dispatch, getState) => {
        const state = getState(),
        chats = Object.values(state.models.chats)
            .filter(chat => chat.connected);

        await Promise.all(chats.map(chat => leaveChat(chat.code)(dispatch, getState))); // Wait and leave all chats

        chats.forEach(chat => {
            chat.refetch = true;
        });

        dispatch({
            type: LOGOUT
        });

        dispatch(switchChat(''));
    }
}

export function setAvatar(url) {
    return {
        type: SET_AVATAR,
        url
    }
}

export function acknowledge(wiki) {
    return {
        type: ACKNOWLEDGE_CHAT,
        wiki
    }
}

export function sendMessage(text, wiki) {
    return (dispatch, getState) => {
        const state = getState(),
        chat = state.models.chats[wiki];
        if (chat && chat.socket) {
            if (chat.private) {
                chat.parent.socket.send(JSON.stringify({
                    attrs: {
                        msgType: 'command',
                        command: 'openprivate',
                        roomId: chat.roomId,
                        users: chat.users
                    }
                }));
            }
            chat.socket.send(JSON.stringify({
                attrs: {
                    msgType: 'chat',
                    name: state.session.name,
                    roomId: chat.roomId,
                    text
                }
            }));
        }
    }
}

export function kickUser(userToKick, wiki) {
    return (dispatch, getState) => {
        const state = getState(),
        chat = state.models.chats[wiki];
        if (chat && chat.socket) {
            chat.socket.send(JSON.stringify({
                attrs: {
                    msgType: 'command',
                    command: 'kick',
                    userToKick
                }
            }));
        }
    }
}

export function banUser(userToBan, time, reason, wiki) {
    return (dispatch, getState) => {
        const state = getState(),
        chat = state.models.chats[wiki];
        if (chat && chat.socket) {
            chat.socket.send(JSON.stringify({
                attrs: {
                    msgType: 'command',
                    command: 'ban',
                    userToBan,
                    time,
                    reason
                }
            }));
        }
    }
}

export function setConfig(key, value) {
    return (dispatch, getState) => {
        const state = getState(),
        { session } = state;
        
        dispatch({
            type: SET_CONFIG,
            id: session.id,
            key,
            value
        });
    }
}
