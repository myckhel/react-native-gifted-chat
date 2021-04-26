import React, { useMemo, useEffect, useRef, useCallback, forwardRef, memo, } from 'react';
import { Animated, Platform, StyleSheet, View, SafeAreaView, Keyboard, } from 'react-native';
import { ActionSheetProvider, } from '@expo/react-native-action-sheet';
import uuid from 'uuid';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import * as utils from './utils';
import { Actions } from './Actions';
import { Avatar } from './Avatar';
import Bubble from './Bubble';
import { SystemMessage } from './SystemMessage';
import { MessageImage } from './MessageImage';
import { MessageText } from './MessageText';
import { Composer } from './Composer';
import { Day } from './Day';
import { InputToolbar } from './InputToolbar';
import { LoadEarlier } from './LoadEarlier';
import Message from './Message';
import MessageContainer from './MessageContainer';
import { Send } from './Send';
import { GiftedChatContext } from './GiftedChatContext';
import { Time } from './Time';
import GiftedAvatar from './GiftedAvatar';
import useMergeState from './hooks/useMergeState';
import { MIN_COMPOSER_HEIGHT, MAX_COMPOSER_HEIGHT, DEFAULT_PLACEHOLDER, TIME_FORMAT, DATE_FORMAT, } from './Constant';
dayjs.extend(localizedFormat);
const GiftedChat = memo(forwardRef((props, ref) => {
    var _a;
    const _this = useRef({
        _isMounted: false,
        _locale: props.locale || 'en',
        _bottomOffset: 0,
        _keyboardHeight: 0,
        _isFirstLayout: true,
        _isTextInputWasFocused: false,
        _actionSheetRef: undefined,
        _maxHeight: undefined,
    });
    const _messageContainerRef = useRef();
    const [state, setState] = useMergeState({
        isInitialized: false,
        composerHeight: props.minComposerHeight || 0,
    });
    const getMaxHeight = () => _this.current._maxHeight;
    const setIsMounted = (value) => (_this.current._isMounted = value);
    const scrollToBottom = (animated = true) => {
        var _a, _b;
        if (_messageContainerRef.current) {
            const { inverted } = props;
            if (!inverted) {
                (_a = _messageContainerRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated });
            }
            else {
                (_b = _messageContainerRef.current) === null || _b === void 0 ? void 0 : _b.scrollToOffset({
                    offset: 0,
                    animated,
                });
            }
        }
    };
    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        };
    }, []);
    useEffect(() => {
        const { messages, inverted } = props;
        if (inverted === false && messages) {
            setTimeout(() => scrollToBottom(false), 200);
        }
    }, [(_a = props.messages) === null || _a === void 0 ? void 0 : _a.length]);
    const getLocale = () => _this.current._locale;
    const setMaxHeight = (height) => (_this.current._maxHeight = height);
    const setIsFirstLayout = (value) => (_this.current._isFirstLayout = value);
    const getIsFirstLayout = () => _this.current._isFirstLayout;
    const notifyInputTextReset = useCallback(() => {
        if (props.onInputTextChanged) {
            props.onInputTextChanged('');
        }
    }, [props.onInputTextChanged]);
    const onInitialLayoutViewLayout = useCallback((e) => {
        const { layout } = e.nativeEvent;
        if (layout.height <= 0) {
            return;
        }
        notifyInputTextReset();
        setMaxHeight(layout.height);
        const newComposerHeight = props.minComposerHeight;
        setState({
            isInitialized: true,
            composerHeight: newComposerHeight,
        });
    }, [notifyInputTextReset, props.minComposerHeight]);
    const onMainViewLayout = useCallback((e) => {
        // TODO: fix an issue when keyboard is dismissing during the initialization
        const { layout } = e.nativeEvent;
        if (getMaxHeight() !== layout.height || getIsFirstLayout() === true) {
            setMaxHeight(layout.height);
        }
        if (getIsFirstLayout() === true) {
            setIsFirstLayout(false);
        }
    }, []);
    if (ref) {
        ref.current = _this.current;
        ref.current.scrollToBottom = scrollToBottom;
    }
    // console.log(ref)
    if (state.isInitialized === true) {
        const { wrapInSafeArea } = props;
        const Wrapper = wrapInSafeArea ? SafeAreaView : View;
        const actionSheet = props.actionSheet || (() => { var _a; return (_a = _this.current._actionSheetRef) === null || _a === void 0 ? void 0 : _a.getContext(); });
        return (<GiftedChatContext.Provider value={{
            actionSheet,
            getLocale,
        }}>
          <Wrapper style={styles.safeArea}>
            <ActionSheetProvider ref={_this.current._actionSheetRef}>
              <View style={styles.container} onLayout={onMainViewLayout}>
                <RenderMessages {...props} messages={props.messages} isTyping={props.isTyping} messagesContainerStyle={props.messagesContainerStyle} renderChatFooter={props.renderChatFooter} inverted={props.inverted} keyboardShouldPersistTaps={props.keyboardShouldPersistTaps} messageContainerRef={_messageContainerRef}/>
                {<RenderInputToolbar {...props} minComposerHeight={props.minComposerHeight} maxInputLength={props.maxInputLength} maxComposerHeight={props.maxComposerHeight} renderInputToolbar={props.renderInputToolbar} messageIdGenerator={props.messageIdGenerator} user={props.user} isKeyboardInternallyHandled={props.isKeyboardInternallyHandled} onSend={props.onSend} onInputTextChanged={props.onInputTextChanged} propsText={props.text} composerHeight={state.composerHeight} setState={setState} _this={_this} notifyInputTextReset={notifyInputTextReset} baseRef={ref}/>}
              </View>
            </ActionSheetProvider>
          </Wrapper>
        </GiftedChatContext.Provider>);
    }
    return (<View style={styles.container} onLayout={onInitialLayoutViewLayout}>
        {props.renderLoading && props.renderLoading()}
      </View>);
}));
const RenderInputToolbar = memo((props) => {
    const { minComposerHeight, maxComposerHeight, composerHeight, maxInputLength, renderInputToolbar, setState, messageIdGenerator, user, onSend: propsOnSend, _this, notifyInputTextReset, baseRef, onInputTextChanged: propsOnInputTextChanged, propsText, isKeyboardInternallyHandled, } = props;
    const textInput = useRef();
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [{ text, typingDisabled }, _setState] = useMergeState({
        text: propsText,
        typingDisabled: false,
    });
    const setText = (text) => _setState({ text });
    const setIsTypingDisabled = (typingDisabled) => _setState({ typingDisabled });
    const setBottomOffset = (value) => (_this.current._bottomOffset = value);
    const safeAreaSupport = (bottomOffset) => bottomOffset != null ? bottomOffset : getBottomSpace();
    /**
     * Refocus the text input only if it was focused before showing keyboard.
     * This is needed in some cases (eg. showing image picker).
     */
    const handleTextInputFocusWhenKeyboardShow = useCallback(() => {
        if (textInput.current &&
            _this.current._isTextInputWasFocused &&
            !textInput.current.isFocused()) {
            textInput.current.focus();
        }
        // Reset the indicator since the keyboard is shown
        _this.current._isTextInputWasFocused = false;
    }, []);
    /**
     * Store text input focus status when keyboard hide to retrieve
     * it after wards if needed.
     * `onKeyboardWillHide` may be called twice in sequence so we
     * make a guard condition (eg. showing image picker)
     */
    const handleTextInputFocusWhenKeyboardHide = () => {
        var _a;
        if (!_this.current._isTextInputWasFocused) {
            _this.current._isTextInputWasFocused =
                ((_a = textInput.current) === null || _a === void 0 ? void 0 : _a.isFocused()) || false;
        }
    };
    const getTextFromProp = useCallback((fallback) => {
        if (propsText === undefined) {
            return fallback;
        }
        return propsText;
    }, [propsText]);
    useEffect(() => {
        // Text prop takes precedence over state.
        if (propsText !== undefined && propsText !== text) {
            setText(propsText);
        }
    }, [propsText]);
    const onInputSizeChanged = useCallback((size) => {
        const newComposerHeight = Math.max(minComposerHeight, Math.min(maxComposerHeight, size.height));
        setState({
            composerHeight: newComposerHeight,
        });
    }, [minComposerHeight, maxComposerHeight]);
    const getIsMounted = () => _this.current._isMounted;
    const resetInputToolbar = useCallback(() => {
        if (textInput.current) {
            textInput.current.clear();
        }
        notifyInputTextReset();
        const newComposerHeight = minComposerHeight;
        setText(getTextFromProp(''));
        setState({
            composerHeight: newComposerHeight,
        });
    }, [notifyInputTextReset, minComposerHeight, getTextFromProp]);
    const onSend = useCallback((messages = [], shouldResetInputToolbar = false) => {
        if (!Array.isArray(messages)) {
            messages = [messages];
        }
        const newMessages = messages.map(message => {
            return {
                ...message,
                user: user,
                createdAt: new Date(),
                _id: messageIdGenerator(),
            };
        });
        if (shouldResetInputToolbar === true) {
            setIsTypingDisabled(true);
            resetInputToolbar();
        }
        if (propsOnSend) {
            propsOnSend(newMessages);
        }
        if (shouldResetInputToolbar === true) {
            setTimeout(() => {
                if (getIsMounted() === true) {
                    setIsTypingDisabled(false);
                }
            }, 100);
        }
    }, [
        user,
        messageIdGenerator,
        resetInputToolbar,
        propsOnSend,
        setIsTypingDisabled,
    ]);
    const getIsTypingDisabled = useCallback(() => typingDisabled, [
        typingDisabled,
    ]);
    const onInputTextChanged = useCallback((text) => {
        if (getIsTypingDisabled()) {
            return;
        }
        if (propsOnInputTextChanged) {
            propsOnInputTextChanged(text);
        }
        // Only set state if it's not being overridden by a prop.
        if (propsText === undefined) {
            setText(text);
        }
    }, [getIsTypingDisabled, propsOnInputTextChanged, propsText]);
    const inputToolbarProps = useMemo(() => ({
        ...props,
        text: getTextFromProp(text),
        composerHeight: Math.max(minComposerHeight, composerHeight),
        onSend,
        onInputSizeChanged,
        onTextChanged: onInputTextChanged,
        textInputProps: {
            ...props.textInputProps,
            ref: textInput,
            maxLength: getIsTypingDisabled() ? 0 : maxInputLength,
        },
    }), [
        onSend,
        getTextFromProp,
        minComposerHeight,
        composerHeight,
        onInputSizeChanged,
        props.textInputProps,
        getIsTypingDisabled,
        maxInputLength,
    ]);
    useEffect(() => {
        const show = Platform.select({
            ios: 'keyboardWillShow',
            android: 'keyboardDidShow',
        }) || 'keyboardWillShow';
        const hide = Platform.select({
            ios: 'keyboardWillHide',
            android: 'keyboardDidHide',
        }) || 'keyboardWillHide';
        Keyboard.addListener(show, () => {
            handleTextInputFocusWhenKeyboardShow();
            if (isKeyboardInternallyHandled) {
                _setState({
                    typingDisabled: false,
                });
                setBottomOffset(safeAreaSupport(_this.current._bottomOffset));
            }
        });
        if (Platform.OS === 'ios') {
            Keyboard.addListener('keyboardWillChangeFrame', ({ duration, endCoordinates, startCoordinates }) => slideTo({
                duration,
                toValue: startCoordinates &&
                    endCoordinates.screenY > startCoordinates.screenY
                    ? 0
                    : endCoordinates.height,
            }));
        }
        Keyboard.addListener(hide, () => {
            handleTextInputFocusWhenKeyboardHide();
            if (isKeyboardInternallyHandled) {
                _setState({
                    typingDisabled: true,
                });
                setBottomOffset(0);
            }
        });
        return () => {
            Keyboard.removeListener(show, () => { });
            Keyboard.removeListener(hide, () => { });
            if (Platform.OS === 'ios') {
                Keyboard.removeListener('keyboardWillChangeFrame', () => { });
            }
        };
    }, [isKeyboardInternallyHandled]);
    const slideTo = ({ toValue, duration, }) => {
        Animated.timing(slideAnim, {
            toValue,
            duration,
            useNativeDriver: false,
        }).start();
    };
    if (baseRef) {
        baseRef.current.onSend = onSend;
    }
    if (renderInputToolbar) {
        return renderInputToolbar(inputToolbarProps);
    }
    return (<Animated.View style={{
        marginBottom: Platform.select({ ios: slideAnim }),
    }}>
      <InputToolbar {...inputToolbarProps}/>
    </Animated.View>);
});
const RenderMessages = memo((props) => {
    const { messages, messageContainerRef, isTyping, messagesContainerStyle, renderChatFooter, inverted, keyboardShouldPersistTaps, } = props;
    const invertibleScrollViewProps = useMemo(() => ({
        inverted,
        keyboardShouldPersistTaps,
    }), [inverted, keyboardShouldPersistTaps]);
    const style = useMemo(() => [
        {
            flex: 1,
        },
        messagesContainerStyle,
    ], [messagesContainerStyle]);
    return (<View style={style}>
      <MessageContainer {...props} invertibleScrollViewProps={invertibleScrollViewProps} messages={messages} forwardRef={messageContainerRef} isTyping={isTyping}/>
      {renderChatFooter && renderChatFooter()}
    </View>);
});
GiftedChat.defaultProps = {
    messages: [],
    messagesContainerStyle: undefined,
    text: undefined,
    placeholder: DEFAULT_PLACEHOLDER,
    disableComposer: false,
    messageIdGenerator: () => uuid.v4(),
    user: { _id: 0 },
    onSend: () => { },
    locale: undefined,
    timeFormat: TIME_FORMAT,
    dateFormat: DATE_FORMAT,
    loadEarlier: false,
    onLoadEarlier: () => { },
    isLoadingEarlier: false,
    renderLoading: undefined,
    renderLoadEarlier: undefined,
    renderAvatar: undefined,
    showUserAvatar: false,
    actionSheet: undefined,
    onPressAvatar: undefined,
    onLongPressAvatar: undefined,
    // renderUsernameOnMessage: false,
    renderAvatarOnTop: false,
    renderBubble: undefined,
    renderSystemMessage: undefined,
    onLongPress: undefined,
    renderMessage: undefined,
    renderMessageText: undefined,
    renderMessageImage: undefined,
    renderMessageVideo: undefined,
    renderMessageAudio: undefined,
    // imageProps: {key, position, user},
    // videoProps: {},
    // audioProps: {},
    lightboxProps: {},
    textInputProps: {},
    listViewProps: {},
    renderCustomView: undefined,
    isCustomViewBottom: false,
    renderDay: undefined,
    renderTime: undefined,
    renderFooter: undefined,
    renderChatEmpty: undefined,
    renderChatFooter: undefined,
    renderInputToolbar: undefined,
    renderComposer: undefined,
    renderActions: undefined,
    renderSend: undefined,
    renderAccessory: undefined,
    isKeyboardInternallyHandled: true,
    onPressActionButton: undefined,
    bottomOffset: undefined,
    minInputToolbarHeight: 44,
    keyboardShouldPersistTaps: Platform.select({
        ios: 'never',
        android: 'always',
        default: 'never',
    }),
    onInputTextChanged: undefined,
    maxInputLength: undefined,
    forceGetKeyboardHeight: false,
    inverted: true,
    extraData: null,
    minComposerHeight: MIN_COMPOSER_HEIGHT,
    maxComposerHeight: MAX_COMPOSER_HEIGHT,
    wrapInSafeArea: true,
};
GiftedChat.append = (currentMessages = [], messages, inverted = true) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    return inverted
        ? messages.concat(currentMessages)
        : currentMessages.concat(messages);
};
GiftedChat.prepend = (currentMessages = [], messages, inverted = true) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    return inverted
        ? currentMessages.concat(messages)
        : messages.concat(currentMessages);
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
export * from './Models';
export { GiftedChat, Actions, Avatar, Bubble, SystemMessage, MessageImage, MessageText, Composer, Day, InputToolbar, LoadEarlier, Message, MessageContainer, Send, Time, GiftedAvatar, utils, };
//# sourceMappingURL=GiftedChat.js.map