// import PropTypes from 'prop-types'
import React, { useState, useMemo, useEffect, useRef, useCallback, forwardRef, memo, } from 'react';
import { Platform, StyleSheet, View, SafeAreaView, KeyboardAvoidingView, } from 'react-native';
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
    const textInput = useRef();
    const _messageContainerRef = useRef();
    const [state, setState] = useMergeState({
        isInitialized: false,
        composerHeight: props.minComposerHeight || 0,
        messagesContainerHeight: undefined,
        typingDisabled: false,
    });
    const setIsTypingDisabled = useCallback((value) => setState({ typingDisabled: value }), []);
    const getMaxHeight = () => _this.current._maxHeight;
    const getMinInputToolbarHeight = () => props.renderAccessory
        ? props.minInputToolbarHeight * 2
        : props.minInputToolbarHeight;
    const calculateInputToolbarHeight = useCallback((composerHeight) => composerHeight +
        (getMinInputToolbarHeight() - props.minComposerHeight), [props.minComposerHeight]);
    /**
     * Returns the height, based on current window size, without taking the keyboard into account.
     */
    const getBasicMessagesContainerHeight = useCallback((composerHeight = state.composerHeight) => getMaxHeight() - calculateInputToolbarHeight(composerHeight), [calculateInputToolbarHeight, state.composerHeight]);
    const getKeyboardHeight = () => {
        if (Platform.OS === 'android' && !props.forceGetKeyboardHeight) {
            // For android: on-screen keyboard resized main container and has own height.
            // @see https://developer.android.com/training/keyboard-input/visibility.html
            // So for calculate the messages container height ignore keyboard height.
            return 0;
        }
        return _this.current._keyboardHeight;
    };
    const getBottomOffset = () => _this.current._bottomOffset;
    /**
     * Returns the height, based on current window size, taking the keyboard into account.
     */
    const getMessagesContainerHeightWithKeyboard = useCallback((composerHeight = state.composerHeight) => getBasicMessagesContainerHeight(composerHeight) -
        getKeyboardHeight() +
        getBottomOffset(), [getBasicMessagesContainerHeight, state.composerHeight]);
    const setIsMounted = (value) => (_this.current._isMounted = value);
    // const setLocale = (locale: string) => (_this.current._locale = locale)
    // const initLocale = () => {
    //   if (props.locale === null) {
    //     setLocale('en')
    //   } else {
    //     setLocale(props.locale || 'en')
    //   }
    // }
    // const setMessages = (messages: TMessage[]) => setState({ messages })
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
        // const { messages, text } = props
        setIsMounted(true);
        // initLocale()
        // setMessages(messages || [])
        // setTextFromProp(text)
        return () => {
            setIsMounted(false);
        };
    }, []);
    // useEffect(() => {
    //   const { messages } = props
    //   if (state.messages !== messages) {
    //     setMessages(messages || [])
    //   }
    // }, [props.messages])
    useEffect(() => {
        const { messages, inverted } = props;
        if (inverted === false && messages) {
            setTimeout(() => scrollToBottom(false), 200);
        }
    }, [(_a = props.messages) === null || _a === void 0 ? void 0 : _a.length]);
    const getLocale = () => _this.current._locale;
    const getTextFromProp = useCallback((fallback) => {
        if (props.text === undefined) {
            return fallback;
        }
        return props.text;
    }, [props.text]);
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
        const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard(newComposerHeight);
        setState({
            isInitialized: true,
            composerHeight: newComposerHeight,
            messagesContainerHeight: newMessagesContainerHeight,
        });
    }, [
        notifyInputTextReset,
        props.minComposerHeight,
        getMessagesContainerHeightWithKeyboard,
        getTextFromProp,
    ]);
    const onMainViewLayout = useCallback((e) => {
        // TODO: fix an issue when keyboard is dismissing during the initialization
        const { layout } = e.nativeEvent;
        if (getMaxHeight() !== layout.height || getIsFirstLayout() === true) {
            setMaxHeight(layout.height);
            setState({
                messagesContainerHeight: _this.current._keyboardHeight > 0
                    ? getMessagesContainerHeightWithKeyboard()
                    : getBasicMessagesContainerHeight(),
            });
        }
        if (getIsFirstLayout() === true) {
            setIsFirstLayout(false);
        }
    }, [getMessagesContainerHeightWithKeyboard, getBasicMessagesContainerHeight]);
    if (ref) {
        ref.current = _this.current;
        ref.current.scrollToBottom = scrollToBottom;
    }
    console.log(ref);
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
                <RenderMessages messages={props.messages} isTyping={props.isTyping} messagesContainerStyle={props.messagesContainerStyle} isKeyboardInternallyHandled={props.isKeyboardInternallyHandled} renderChatFooter={props.renderChatFooter} inverted={props.inverted} keyboardShouldPersistTaps={props.keyboardShouldPersistTaps} messagesContainerProps={props} messageContainerRef={_messageContainerRef} messagesContainerHeight={state.messagesContainerHeight} setIsTypingDisabled={setIsTypingDisabled} textInput={textInput} _this={_this} setState={setState} getMessagesContainerHeightWithKeyboard={getMessagesContainerHeightWithKeyboard} getBasicMessagesContainerHeight={getBasicMessagesContainerHeight}/>
                {<RenderInputToolbar {...props} minComposerHeight={props.minComposerHeight} maxInputLength={props.maxInputLength} maxComposerHeight={props.maxComposerHeight} renderInputToolbar={props.renderInputToolbar} messageIdGenerator={props.messageIdGenerator} user={props.user} onSend={props.onSend} onInputTextChanged={props.onInputTextChanged} propsText={props.text} textInput={textInput} composerHeight={state.composerHeight} getTextFromProp={getTextFromProp} setState={setState} getMessagesContainerHeightWithKeyboard={getMessagesContainerHeightWithKeyboard} _this={_this} notifyInputTextReset={notifyInputTextReset} setIsTypingDisabled={setIsTypingDisabled} baseRef={ref} typingDisabled={state.typingDisabled}/>}
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
    const { getTextFromProp, minComposerHeight, maxComposerHeight, composerHeight, textInput, maxInputLength, renderInputToolbar, setState, getMessagesContainerHeightWithKeyboard, messageIdGenerator, user, onSend: propsOnSend, _this, notifyInputTextReset, setIsTypingDisabled, baseRef, typingDisabled, onInputTextChanged: propsOnInputTextChanged, propsText, } = props;
    const [text, setText] = useState(propsText);
    const setTextFromProp = (textProp) => {
        // Text prop takes precedence over state.
        if (textProp !== undefined && textProp !== text) {
            setText(textProp);
        }
    };
    useEffect(() => {
        setTextFromProp(propsText);
    }, [propsText]);
    console.log(2);
    const onInputSizeChanged = useCallback((size) => {
        const newComposerHeight = Math.max(minComposerHeight, Math.min(maxComposerHeight, size.height));
        const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard(newComposerHeight);
        setState({
            composerHeight: newComposerHeight,
            messagesContainerHeight: newMessagesContainerHeight,
        });
    }, [
        minComposerHeight,
        maxComposerHeight,
        getMessagesContainerHeightWithKeyboard,
    ]);
    const getIsMounted = () => _this.current._isMounted;
    const resetInputToolbar = useCallback(() => {
        if (textInput.current) {
            textInput.current.clear();
        }
        notifyInputTextReset();
        const newComposerHeight = minComposerHeight;
        const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard(newComposerHeight);
        setText(getTextFromProp(''));
        setState({
            composerHeight: newComposerHeight,
            messagesContainerHeight: newMessagesContainerHeight,
        });
    }, [
        notifyInputTextReset,
        minComposerHeight,
        getMessagesContainerHeightWithKeyboard,
        getTextFromProp,
    ]);
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
    const inputToolbarProps = {
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
    };
    if (baseRef) {
        baseRef.current.onSend = onSend;
    }
    if (renderInputToolbar) {
        return renderInputToolbar(inputToolbarProps);
    }
    return <InputToolbar {...inputToolbarProps}/>;
});
const RenderMessages = memo(({ messagesContainerHeight, messages, messageContainerRef, isTyping, messagesContainerStyle, isKeyboardInternallyHandled, renderChatFooter, inverted, keyboardShouldPersistTaps, setIsTypingDisabled, getBasicMessagesContainerHeight, getMessagesContainerHeightWithKeyboard, textInput, setState, _this, messagesContainerProps, }) => {
    console.log(1);
    const setBottomOffset = (value) => (_this.current._bottomOffset = value);
    const safeAreaSupport = (bottomOffset) => bottomOffset != null ? bottomOffset : getBottomSpace();
    const setKeyboardHeight = (height) => (_this.current._keyboardHeight = height);
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
    const onKeyboardWillShow = useCallback((e) => {
        handleTextInputFocusWhenKeyboardShow();
        if (isKeyboardInternallyHandled) {
            setIsTypingDisabled(true);
            setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : e.end.height);
            setBottomOffset(safeAreaSupport(_this.current._bottomOffset));
            const newMessagesContainerHeight = getMessagesContainerHeightWithKeyboard();
            setState({
                messagesContainerHeight: newMessagesContainerHeight,
            });
        }
    }, [
        handleTextInputFocusWhenKeyboardShow,
        isKeyboardInternallyHandled,
        _this.current._bottomOffset,
        getMessagesContainerHeightWithKeyboard,
    ]);
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
    const onKeyboardWillHide = useCallback((_e) => {
        handleTextInputFocusWhenKeyboardHide();
        if (isKeyboardInternallyHandled) {
            setIsTypingDisabled(true);
            setKeyboardHeight(0);
            setBottomOffset(0);
            const newMessagesContainerHeight = getBasicMessagesContainerHeight();
            setState({
                messagesContainerHeight: newMessagesContainerHeight,
            });
        }
    }, [
        handleTextInputFocusWhenKeyboardHide,
        isKeyboardInternallyHandled,
        getBasicMessagesContainerHeight,
    ]);
    const onKeyboardDidShow = useCallback((e) => {
        onKeyboardWillShow(e);
        setIsTypingDisabled(false);
    }, [onKeyboardWillShow]);
    const onKeyboardDidHide = useCallback((e) => {
        onKeyboardWillHide(e);
        setIsTypingDisabled(false);
    }, [onKeyboardWillHide]);
    const invertibleScrollViewProps = useMemo(() => Platform.select({
        ios: {
            inverted,
            keyboardShouldPersistTaps,
            onKeyboardWillShow,
            onKeyboardWillHide,
        },
        android: {
            inverted,
            keyboardShouldPersistTaps,
            onKeyboardDidShow,
            onKeyboardDidHide,
        },
    }), [
        inverted,
        keyboardShouldPersistTaps,
        onKeyboardWillShow,
        onKeyboardWillHide,
        onKeyboardDidShow,
        onKeyboardDidHide,
    ]);
    const KeyboardAvoidableView = useMemo(() => (isKeyboardInternallyHandled ? KeyboardAvoidingView : View), [isKeyboardInternallyHandled]);
    const style = useMemo(() => [
        {
            height: messagesContainerHeight,
        },
        messagesContainerStyle,
    ], [messagesContainerHeight, messagesContainerStyle]);
    return (<KeyboardAvoidableView enabled={!!isKeyboardInternallyHandled} style={style}>
        <MessageContainer {...messagesContainerProps} invertibleScrollViewProps={invertibleScrollViewProps} messages={messages} forwardRef={messageContainerRef} isTyping={isTyping}/>
        {renderChatFooter && renderChatFooter()}
      </KeyboardAvoidableView>);
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