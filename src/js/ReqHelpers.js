class Req {
    /**
     * Request & JSON if specified.
     * 
     * @typedef { Object } ReqResponse
     * @property { Response } response - Request response object.
     * @property { Object? } json - JSON data from response, if enabled through parameter.
     */

    static helpers = {
        getHeaders: (extra) => {
            const def = {
                "Content-type": "application/json"
            };

            if (!extra) return def;

            // If additional headers are given, add them to main headers.
            for (const [key, val] of Object.entries(extra)) {
                def[key] = val;
            }

            return def;
        },

        makeRequest: async(url, opts, useJson) => {
            const returnData = {};

            const req = await fetch(url, opts);
            returnData.response = req;

            // If returning json, then add it to the object.
            if (useJson) {
                try {
                    returnData.json = await req.json();
                } catch {
                    returnData.json = null;
                }
            }
            
            return returnData;
        },

        formOptions: (method, headers, body) => {
            const obj = {
                method,
                headers
            };

            if (body) obj.body = JSON.stringify(body);
            return obj;
        },

        full: (method, url, body, useJson, headers) => {
            const allHeaders = this.helpers.getHeaders(headers);
            const opts = this.helpers.formOptions(method, allHeaders, body);

            return this.helpers.makeRequest(url, opts, useJson);
        }
    };

    /**
     * Make a GET request to a given url.
     * 
     * @param { String } url - URL to GET.
     * @param { Object? } headers - Optional additional headers.
     * @returns { Promise<ReqResponse> }
     */
    static async GET(url, headers = {}) {
        // GET always uses json.
        const useJson = true;
        return this.helpers.full("GET", url, null, useJson, headers);
    }
    static get = this.GET;

    /**
     * Make a POST request to a given url.
     * 
     * @param { String } url - URL to request.
     * @param { Object } body - Body data.
     * @param { Boolean? } useJson - Should it also return json? (does not by default.)
     * @param { Object? } headers - Optional additional headers.
     * @returns { Promise<ReqResponse> }
     */
    static async POST(url, body = {}, useJson = false, headers = {}) {
        return this.helpers.full("POST", url, body, useJson, headers);
    }
    static post = this.POST;

    /**
     * Make a PATCH request to a given url.
     * 
     * @param { String } url - URL to request.
     * @param { Object } body - Body data.
     * @param { Boolean? } useJson - Should it also return json? (does not by default.)
     * @param { Object? } headers - Optional additional headers.
     * @returns { Promise<ReqResponse> }
     */
    static async PATCH(url, body = {}, useJson = false, headers = {}) {
        return this.helpers.full("PATCH", url, body, useJson, headers);
    }
    static patch = this.PATCH;

    /**
     * Make a DELETE request to a given url.
     * 
     * @param { String } url - URL to request.
     * @param { Object } body - Body data.
     * @param { Boolean? } useJson - Should it also return json? (does not by default.)
     * @param { Object? } headers - Optional additional headers.
     * @returns { Promise<ReqResponse> }
     */
    static async DELETE(url, body = {}, useJson = false, headers = {}) {
        return this.helpers.full("DELETE", url, body, useJson, headers);
    }
    static delete = this.DELETE;

    /**
     * Make a PUT request to a given url.
     * 
     * @param { String } url - URL to request.
     * @param { Object } body - Body data.
     * @param { Boolean? } useJson - Should it also return json? (does not by default.)
     * @param { Object? } headers - Optional additional headers.
     * @returns { Promise<ReqResponse> }
     */
    static async PUT(url, body = {}, useJson = false, headers = {}) {
        return this.helpers.full("PUT", url, body, useJson, headers);
    }
    static put = this.PUT;
}