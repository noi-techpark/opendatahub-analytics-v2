// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createFetch } from '@vueuse/core'
import { useAuth } from '../domain/auth/store/auth'

export const useFetchWithAuth = (url: string) => {
   const auth = useAuth()

   return createFetch({
      options: {
         beforeFetch({ options }) {
            if (auth.accessToken) {
               options.headers = {
                  ...options.headers,
                  Authorization: `Bearer ${auth.accessToken}`,
               }
            }
            return { options }
         },
      },
   })(url)
}

/**
 * Wraps a string value in double quotes for use in a `where` filter,
 * escaping characters that are special in the filter syntax.
 * Numbers and booleans must NOT be quoted.
 */
export const quoteWhereValue = (value: string): string =>
   `"${value.replace(/(['"()\\])/g, '\\$1')}"`
