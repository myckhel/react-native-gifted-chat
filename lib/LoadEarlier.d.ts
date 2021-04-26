import PropTypes from 'prop-types';
import React from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
export interface LoadEarlierProps {
    isLoadingEarlier?: boolean;
    label?: string;
    containerStyle?: StyleProp<ViewStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    activityIndicatorStyle?: StyleProp<ViewStyle>;
    activityIndicatorColor?: string;
    activityIndicatorSize?: number | 'small' | 'large';
    onLoadEarlier?(): void;
}
export declare function LoadEarlier(props: LoadEarlierProps): React.ReactElement;
export declare namespace LoadEarlier {
    var defaultProps: {
        onLoadEarlier: () => void;
        isLoadingEarlier: boolean;
        label: string;
        containerStyle: {};
        wrapperStyle: {};
        textStyle: {};
        activityIndicatorStyle: {};
        activityIndicatorColor: string;
        activityIndicatorSize: string;
    };
    var propTypes: {
        onLoadEarlier: PropTypes.Requireable<(...args: any[]) => any>;
        isLoadingEarlier: PropTypes.Requireable<boolean>;
        label: PropTypes.Requireable<string>;
        containerStyle: PropTypes.Requireable<number | boolean | object>;
        wrapperStyle: PropTypes.Requireable<number | boolean | object>;
        textStyle: PropTypes.Requireable<number | boolean | object>;
        activityIndicatorStyle: PropTypes.Requireable<number | boolean | object>;
        activityIndicatorColor: PropTypes.Requireable<string>;
        activityIndicatorSize: PropTypes.Requireable<string>;
    };
}
