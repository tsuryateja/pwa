import React, {useCallback, useEffect, useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { fromReactIntl, toReactIntl } from '@magento/venia-ui/lib/util/formatLocale';
import { gql, useQuery } from '@apollo/client';

const GET_LOCALE = gql`
    query getLocale {
        # eslint-disable-next-line @graphql-eslint/require-id-when-available
        storeConfig {
            store_code
            locale
            translations
        }
    }
`;

const LocaleProvider = props => {
    console.log('My locale provider triggering')
    const [messages, setMessages] = useState(null);
    const { data } = useQuery(GET_LOCALE, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first'
    });

    const language = useMemo(() => {
        console.log('Use memo callled')
        
        // console.log('messages', messages)
        if(data && data.storeConfig.locale) {
            setMessages(data.storeConfig.translations);
            return toReactIntl(data.storeConfig.locale)
        } else {
            return DEFAULT_LOCALE;
        }
    }, [data]);    

    const handleIntlError = useCallback(error => {
        if (messages) {
            if (error.code === 'MISSING_TRANSLATION') {
                console.warn('Missing translation', error.message);
                return;
            }
            throw error;
        }
    }, []);

    return (
        <IntlProvider
            key={language}
            {...props}
            defaultLocale={DEFAULT_LOCALE}
            locale={language}
            messages={messages}
            onError={handleIntlError}
        />
    );
};

export default LocaleProvider;
