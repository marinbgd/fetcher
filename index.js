const MINUTE_IN_MS = 60000
const DEFAULT_FETCH_CACHE_TIME = MINUTE_IN_MS; 

class Ajax {
    constructor () {
        this.cache = {}
    }

    get ({
        url,
        params = null, 
        headers = null, 
        isCached = false,
        cacheExpireInMs = DEFAULT_FETCH_CACHE_TIME,
    }) {
        const urlWithParams = this._addParamsToUrl(url, params)
        const options = this._addHeadersToOptions(headers)
        const fetchPromiseCallArgs = this._getFetchArgs(urlWithParams, options)
        
        if ( isCached && this._isAjaxRequestInProgress( urlWithParams ) ) {
            return this._getAjaxRequestInProgress( urlWithParams );
        }
    
        let fetchPromise = window.fetch( ...fetchPromiseCallArgs )
            .then( this._handleFetchErrors )
            .then( response => response.json() )
            .finally( () => {
                this._clearAjaxRequestPromise( urlWithParams );
            });
        
        if (isCached) {
            this._persistAjaxRequestPromise({ urlWithParams, ajaxPromise: fetchPromise })
        }
    
        return fetchPromise
    }

    _isAjaxRequestInProgress( urlWithParams ) {
        return !!(this.cache[urlWithParams] && this.cache[urlWithParams].ajaxPromise);
    }

    _getAjaxRequestInProgress( urlWithParams ) {
        return this.cache[urlWithParams].ajaxPromise;
    }

    _persistAjaxRequestPromise( { urlWithParams, ajaxPromise } ) {
        this.cache[urlWithParams] = {
            ...this.cache[urlWithParams],
            ajaxPromise,
        };
    }

    _clearAjaxRequestPromise( urlWithParams ) {
        if (!this.cache[urlWithParams]) {
            this.cache[urlWithParams] = {};
        }
        this.cache[urlWithParams].ajaxPromise = null;
    }
    
    _handleFetchErrors (fetchResponse) {
        if (!fetchResponse.ok) {
            throw Error(fetchResponse.statusText);
        }
        return fetchResponse;
    }
    
    _getFetchArgs (urlWithParams, options) {
        let fetchPromiseCallArgs = [urlWithParams]
        if (options) {
            fetchPromiseCallArgs = [urlWithParams, options]
        }
        return fetchPromiseCallArgs
    }
    
    _getEncodedParams (params) {
        if (!params) {
            return params
        }
    
        let encodedParams = {}
        Object.keys(params).forEach( key => {
            const encodedKey = window.encodeURIComponent(key)
            const encodedParam = window.encodeURIComponent(params[key])
            encodedParams[encodedKey] = encodedParam
        })
        return encodedParams
    }

    _addParamsToUrl (url, params) {
        if (!params) {
            return url
        }
    
        const encodedParams = this._getEncodedParams(params)
        const keys = Object.keys(encodedParams)
        const orderedKeys = keys.sort()
        let urlWithQuery = url
        orderedKeys.forEach((key, index) => {
            if (index === 0) {
                urlWithQuery += `?${key}=${encodedParams[key]}`
            } else {
                urlWithQuery += `&${key}=${encodedParams[key]}`
            }
        })
    
        return urlWithQuery
    }
    
    _addHeadersToOptions (options = {}, headers = null) {
        if (!headers) {
            return options
        }
    
        const newHeaders = new Headers(headers)
        return {
            ...options,
            headers: newHeaders
        }
    }
    
    resetCache () {
        this.cache = {}
    }
}


const defaultAjaxInstance = new Ajax()

export default defaultAjaxInstance
