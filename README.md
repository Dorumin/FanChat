FanChat (or FANChat, if you wanna be that guy) is a mobile client for Wikia's Special:Chat extension built in React Native via [create-react-native-app](https://github.com/react-community/create-react-native-app)

## Features
* Easy moderation
* Persistent storage across multiple accounts (note: not across devices, we do not keep your data anywhere)
* Connect to multiple chats at once
* Updating user info through the app (avatar, global masthead, changing password)
* Not made by wikia
* Configurable local notifications and (non-sound) pings
* Emoticon picker
* Just about everything you should expect from a modern chat app

## Releases
[First public release is out! v0.0.1](../../releases/tag/v0.0.1)

## Screenshots
<img src="https://i.imgur.com/WkDS8gi.png" alt="Demo1" width="200" style="float: left;">
<img src="https://i.imgur.com/N2ipWTZ.png" alt="Demo2" width="200" style="float: left;">
<img src="https://i.imgur.com/MWma9ia.png" alt="Demo3" width="200" style="float: left;">
<img src="https://i.imgur.com/Uk7VEQQ.png" alt="Demo4" width="200" style="float: left;">

## Build it yourself
In case you don't trust my .apk release (I don't blame you), you can build the package yourself from scratch.

0. Install node, npm, and git.
1. `git clone` this repo
2. Install dependencies with `npm install`
3. `npm install exp` (not _really_ a dependency, so done separately)
4. Sign up into [expo](https://expo.io/signup) and `exp login`
5. `exp build:android`
6. ???
7. Profit

## FAQ
* Does it work on an iPhone?
  * I dunno, maybe? I don't own an iAnything. In theory, the app should be cross-platform, but it's primarily designed to work on Android.
* Can you stay connected to the chat while you're on other apps?
  * No. This is a limitation with React Native, not the app. It should give you about a minute before others see you disconnect, but once you bring the app to the foreground you should reconnect instantly.
* Does it have ads?
  * Do I look like I work for wikia?
* Why should I trust to put my password into this app?
  * The whole code is open source. [See for yourself](screens/Login.js), we don't do anything with your account information.
* Can you upload GIF avatars through this?
  * No, the cropping tool turns them into still images. And I can't stand non-square gif avatars so you're not getting that.
* Can I translate this to other languages?
  * Not yet. If I notice there's an interest in translating this application, I may add support for localization.
* What license is this project released under?
  * Who cares?
* Why is it so ugly?
  * Because I'm not a graphics designer, dude. I aimed to make the most basic chat UI possible and stole most icons from google images.
* How do I navigate on this piece of crap?
  * Just press and long press everything and you're bound to get to somewhere. Also, you leave chats by pressing the wordmark once you're connected. I was told that's kind of obscure.

## TODO
* Internationalization, if needed
* Notificatons
  * Only if I ever figure out how to stay connected after going in background
* Dark theme